from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from django.db.models import Q, Prefetch
from django.utils.dateparse import parse_date
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import FieldError
from .serializers import RequestOTPSerializer, VerifyOTPSerializer, ResetPasswordSerializer
from .models import PasswordOTP
from .emails import send_password_otp_email
from django.contrib.auth import get_user_model
from .models import (
    Job, Customer, Driver, Role, UserRole, Comment, Truck, DriverTruckAssignment,
    Operator, Address, JobDriverAssignment, DeviceToken, Invoice, InvoiceLine,
    PayReport, PayReportLine, JOB_STATUS_CHOICES
)
from .serializers import (
    JobSerializer, CustomerSerializer, DriverSerializer, RoleSerializer,
    UserSerializer, UserRoleSerializer, CommentSerializer, TruckSerializer,
    DriverTruckAssignmentSerializer, OperatorSerializer, AddressSerializer,
    JobDriverAssignmentSerializer, DeviceTokenSerializer, InvoiceSerializer,
    InvoiceLineSerializer, PayReportSerializer, PayReportLineSerializer
)
from .permissions import IsDriver, IsManager, IsManagerOrDriver
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
import requests

# For user model
User = get_user_model()

# Basic test view
def home(request):
    return HttpResponse("Hello, this is the home page!")

def send_push_notification(expo_token, title, body, data=None):
    url = "https://exp.host/--/api/v2/push/send"

    payload = {
        "to": expo_token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data or {}
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        #print("Expo response:", response.json())
        return response.json()
    except Exception as e:
        print("Push notification error:", str(e))
        return None
        
# ViewSets for basic CRUD APIs
class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsManagerOrDriver]
    
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsManagerOrDriver]
    queryset = Job.objects.select_related(
        'prime_contractor_customer',
        'loading_address',
        'unloading_address',
        'backhaul_loading_address',
        'backhaul_unloading_address',
    )

    def get_queryset(self):
        qs = self.queryset
        date = self.request.query_params.get('date')
        customer_id = self.request.query_params.get('customer_id')
        q = self.request.query_params.get('q')
        if date:
            qs = qs.filter(job_date=date)
        if customer_id:
            qs = qs.filter(prime_contractor_customer_id=customer_id)
        if q:
            qs = qs.filter(Q(job_number__icontains=q) | Q(project__icontains=q))
        return qs

class JobDriverAssignmentViewSet(viewsets.ModelViewSet):
    queryset         = JobDriverAssignment.objects.select_related(
                         'job',
                         'driver_truck__driver',
                         'driver_truck__truck'
                       )
    serializer_class = JobDriverAssignmentSerializer
    permission_classes = [IsManagerOrDriver]

    @extend_schema(responses=JobDriverAssignmentSerializer(many=True))
    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        """
        Returns job assignments for the logged-in driver only.
        Endpoint: GET /api/job-driver-assignments/my-jobs/
        """

        user = request.user

        if not user or not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        assignments = self.queryset.filter(
            driver_truck__driver__user=user
        )

        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Update the status of a job assignment (en_route, on_site, completed)",
        request=inline_serializer(
            name='JobDriverAssignmentStatusUpdateRequest',
            fields={
                'status': serializers.CharField(),
                'expected_status': serializers.CharField(required=False),
                'occurred_at': serializers.DateTimeField(required=False),
            },
        ),
        responses=JobDriverAssignmentSerializer,
    )
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        assignment = self.get_object()

        if assignment.driver_truck.driver.user != request.user:
            return Response({'error': 'Forbidden'}, status=403)

        new_status = request.data.get('status')
        if new_status not in dict(JOB_STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)

        current_status = assignment.status
        expected_status = request.data.get('expected_status')

        if expected_status is not None and expected_status not in dict(JOB_STATUS_CHOICES):
            return Response(
                {
                    'error': 'Invalid expected_status',
                    'allowed_statuses': list(dict(JOB_STATUS_CHOICES).keys()),
                },
                status=400
            )

        # If client provides the status it last saw, reject stale writes.
        if expected_status is not None and expected_status != current_status:
            return Response(
                {
                    'code': 'SYNC_CONFLICT',
                    'error': 'Conflict: assignment status changed on the server.',
                    'current_status': current_status,
                    'expected_status': expected_status,
                    'requested_status': new_status,
                },
                status=409
            )

        occurred_at_raw = request.data.get('occurred_at')
        if occurred_at_raw in (None, ''):
            action_time = timezone.now()
        else:
            datetime_field = serializers.DateTimeField()
            try:
                action_time = datetime_field.to_internal_value(occurred_at_raw)
            except serializers.ValidationError:
                return Response(
                    {'error': 'Invalid occurred_at. Use an ISO 8601 datetime.'},
                    status=400,
                )

        if new_status == 'en_route':
            assignment.started_at = action_time
        if new_status == 'on_site':
            assignment.on_site_at = action_time
        if new_status == 'completed':
            assignment.completed_at = action_time

        assignment.status = new_status
        assignment.save()

        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    def perform_create(self, serializer):
        assignment = serializer.save()

        try:
            driver = assignment.driver_truck.driver
            user = driver.user
            job = assignment.job

            device_tokens = DeviceToken.objects.filter(user=user)

            for device in device_tokens:
                send_push_notification(
                    expo_token=device.token,
                    title="New Job Assigned",
                    body=f"You have been assigned to Job {job.job_number}",
                    data={
                        "jobId": job.id,
                        "jobNumber": job.job_number
                    }
                )

        except Exception as e:
            print("Error sending push notification:", str(e))

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('company_name')
    serializer_class = CustomerSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(company_name__icontains=q)
        return qs

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('id')
    serializer_class = DriverSerializer
    permission_classes = [IsManagerOrDriver]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            return qs.filter(user=user)

        return qs

    @extend_schema(summary="Get authenticated driver's profile")
    @action(detail=False, methods=['get'])
    def me(self, request):
        driver = Driver.objects.filter(user=request.user).first()
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)
        serializer = self.get_serializer(driver)
        return Response(serializer.data)

    @extend_schema(
        summary="Get jobs assigned to the authenticated driver",
        parameters=[
            OpenApiParameter(name='date', description='Filter by date (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='upcoming', description='Filter for upcoming jobs from today', required=False, type=str),
        ]
    )
    @action(detail=False, methods=['get'], url_path='me/jobs')
    def jobs(self, request):
        driver = Driver.objects.filter(user=request.user).first()
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)

        # Get active truck assignments for this driver
        truck_assignments = DriverTruckAssignment.objects.filter(
            driver=driver, unassigned_at__isnull=True
        )

        # Get active job assignments for those trucks
        job_assignments = JobDriverAssignment.objects.filter(
            driver_truck__in=truck_assignments,
            unassigned_at__isnull=True
        ).select_related(
            'job__loading_address',
            'job__unloading_address',
            'job__prime_contractor_customer'
        )

        jobs = [ja.job for ja in job_assignments]

        # Optional filters
        date_param = request.query_params.get('date')
        upcoming = request.query_params.get('upcoming')
        if date_param:
            jobs = [j for j in jobs if str(j.job_date) == date_param]
        elif upcoming:
            from datetime import date
            today = date.today()
            jobs = [j for j in jobs if j.job_date >= today]

        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = JobSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def _get_authenticated_driver(self, request):
        return Driver.objects.filter(user=request.user).first()

    def _clock_status_payload(self, driver):
        return {
            'is_clocked_in': driver.is_clocked_in,
            'clocked_in': driver.is_clocked_in,
            'last_clocked_in_at': driver.last_clocked_in_at,
            'last_clocked_out_at': driver.last_clocked_out_at,
        }

    @extend_schema(summary="Get authenticated driver's clock status")
    @action(detail=False, methods=['get'], url_path='clock-status')
    def clock_status(self, request):
        driver = self._get_authenticated_driver(request)
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)
        return Response(self._clock_status_payload(driver), status=200)

    @extend_schema(summary="Set authenticated driver's clock status")
    @clock_status.mapping.patch
    @clock_status.mapping.put
    @clock_status.mapping.post
    def set_clock_status(self, request):
        driver = self._get_authenticated_driver(request)
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)

        requested_state = request.data.get('is_clocked_in', request.data.get('clocked_in'))
        if requested_state is None:
            return Response({'error': 'is_clocked_in (or clocked_in) is required.'}, status=400)

        if isinstance(requested_state, str):
            normalized = requested_state.strip().lower()
            if normalized in ['true', '1', 'yes', 'y', 'on']:
                requested_state = True
            elif normalized in ['false', '0', 'no', 'n', 'off']:
                requested_state = False
            else:
                return Response({'error': 'is_clocked_in must be a boolean value.'}, status=400)
        elif not isinstance(requested_state, bool):
            return Response({'error': 'is_clocked_in must be a boolean value.'}, status=400)

        driver.is_clocked_in = requested_state
        if requested_state:
            driver.last_clocked_in_at = timezone.now()
        else:
            driver.last_clocked_out_at = timezone.now()
        driver.save(update_fields=['is_clocked_in', 'last_clocked_in_at', 'last_clocked_out_at'])

        return Response(self._clock_status_payload(driver), status=200)

    @extend_schema(summary="Clock in authenticated driver")
    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        driver = self._get_authenticated_driver(request)
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)

        driver.is_clocked_in = True
        driver.last_clocked_in_at = timezone.now()
        driver.save(update_fields=['is_clocked_in', 'last_clocked_in_at'])
        return Response(self._clock_status_payload(driver), status=200)

    @extend_schema(summary="Clock out authenticated driver")
    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        driver = self._get_authenticated_driver(request)
        if not driver:
            return Response({'error': 'No driver profile found for this user.'}, status=404)

        driver.is_clocked_in = False
        driver.last_clocked_out_at = timezone.now()
        driver.save(update_fields=['is_clocked_in', 'last_clocked_out_at'])
        return Response(self._clock_status_payload(driver), status=200)

    @extend_schema(summary="Get dashboard summary for the authenticated driver")
    @action(detail=False, methods=['get'], url_path='me/summary')
    def summary(self, request):
        from datetime import date
        driver = get_object_or_404(Driver, user=request.user)
        today = date.today()

        truck_assignments = DriverTruckAssignment.objects.filter(
            driver=driver, unassigned_at__isnull=True
        )
        job_assignments = JobDriverAssignment.objects.filter(
            driver_truck__in=truck_assignments,
            unassigned_at__isnull=True,
            job__job_date__gte=today
        ).select_related('job').order_by('job__job_date')[:10]

        return Response({
            'driver': DriverSerializer(driver).data,
            'upcoming_job_count': job_assignments.count(),
            'next_job': JobSerializer(job_assignments.first().job).data if job_assignments.exists() else None,
        })

class TruckViewSet(viewsets.ModelViewSet):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    permission_classes = [IsManagerOrDriver]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsManager]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsManager]

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsManager]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsManager]

class DriverTruckAssignmentViewSet(viewsets.ModelViewSet):
    queryset = DriverTruckAssignment.objects.all()
    serializer_class = DriverTruckAssignmentSerializer
    permission_classes = [IsManager]
    
class DeviceTokenViewSet(viewsets.ModelViewSet):
    queryset = DeviceToken.objects.all()
    serializer_class = DeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DeviceToken.objects.filter(user=self.request.user)

    def create(self, request):
        token_value = request.data.get('token')
        platform = request.data.get('platform')

        if not token_value or not platform:
            return Response(
                {'error': 'token and platform are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if platform not in ['ios', 'android']:
            return Response(
                {'error': 'platform must be ios or android'},
                status=status.HTTP_400_BAD_REQUEST
            )

        device_token, created = DeviceToken.objects.update_or_create(
            token=token_value,
            defaults={
                'user': request.user,
                'platform': platform
            }
        )

        serializer = self.get_serializer(device_token)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

# Authentication views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.all()
    serializer_class = OperatorSerializer
    permission_classes = [IsManager]

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except AuthenticationFailed:
            return Response(
                {"error": "Invalid username or password.", "code": "INVALID_CREDENTIALS"},
                status=status.HTTP_401_UNAUTHORIZED
            )

class CustomTokenRefreshView(TokenRefreshView):
    pass

# Protected test endpoint
@extend_schema(
    responses=inline_serializer(
        name='ProtectedViewResponse',
        fields={'message': serializers.CharField()},
    )
)
@api_view(["GET"])
@permission_classes([IsManagerOrDriver])
def protected_view(request):
    return Response({"message": "This is a protected view!"}, status=status.HTTP_200_OK)

# API: Assign a truck to a driver
@extend_schema(
    request=inline_serializer(
        name='AssignTruckRequest',
        fields={
            'driver_id': serializers.IntegerField(),
            'truck_id': serializers.IntegerField(),
        },
    ),
    responses=inline_serializer(
        name='AssignTruckResponse',
        fields={'message': serializers.CharField()},
    ),
)
@api_view(["POST"])
@permission_classes([IsManager])
def assign_truck_to_driver(request):
    driver_id = request.data.get('driver_id')
    truck_id = request.data.get('truck_id')

    if not driver_id or not truck_id:
        return Response({'error': 'driver_id and truck_id are required.'}, status=400)

    try:
        driver = Driver.objects.get(id=driver_id)
        truck = Truck.objects.get(id=truck_id)
        assignment = DriverTruckAssignment.objects.create(driver=driver, truck=truck)
        return Response({'message': 'Truck assigned to driver successfully.'})
    except Driver.DoesNotExist:
        return Response({'error': 'Driver not found.'}, status=404)
    except Truck.DoesNotExist:
        return Response({'error': 'Truck not found.'}, status=404)

# API: Show all drivers and trucks
@api_view(["GET"])
@permission_classes([IsManager])
def drivers_and_trucks(request):
    drivers = Driver.objects.all()
    trucks = Truck.objects.all()
    driver_data = DriverSerializer(drivers, many=True).data
    truck_data = TruckSerializer(trucks, many=True).data
    return Response({
        "drivers": driver_data,
        "trucks": truck_data
    })

@extend_schema(responses=TruckSerializer(many=True))
@api_view(['GET'])
@permission_classes([IsManager])
def unassigned_trucks(request):
    # Get only truck IDs that are currently assigned (not unassigned yet)
    assigned_truck_ids = DriverTruckAssignment.objects.filter(unassigned_at__isnull=True).values_list('truck_id', flat=True)
    
    # Exclude those from available trucks
    unassigned = Truck.objects.exclude(id__in=assigned_truck_ids)
    
    serializer = TruckSerializer(unassigned, many=True)
    return Response(serializer.data)

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    Endpoints:
      GET    /api/invoices/
      POST   /api/invoices/
      GET    /api/invoices/{id}/
      PATCH  /api/invoices/{id}/
      DELETE /api/invoices/{id}/
    Filters (query params): customer, project, status, date
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsManagerOrDriver]

    def get_queryset(self):
        qs = (Invoice.objects
              .select_related("customer", "job")
              .prefetch_related(Prefetch("lines", queryset=InvoiceLine.objects.all()))
              .order_by("-id"))

        user = self.request.user
        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            qs = qs.filter(submitted_by_driver__user=user)

        customer = self.request.query_params.get("customer")
        project  = self.request.query_params.get("project")
        status_  = self.request.query_params.get("status")
        date     = self.request.query_params.get("date")

        if customer:
            qs = qs.filter(customer__company_name__icontains=customer)
        if project:
            qs = qs.filter(job__project__icontains=project)
        if status_:
            qs = qs.filter(status=status_)
        if date:
            qs = qs.filter(invoice_date=date)
        return qs


class InvoiceLineViewSet(viewsets.ModelViewSet):
    """
    Optional: expose line-level CRUD (useful for editing lines later)
    """
    queryset = InvoiceLine.objects.select_related("invoice").all()
    serializer_class = InvoiceLineSerializer
    permission_classes = [IsManagerOrDriver]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            qs = qs.filter(invoice__submitted_by_driver__user=user)
        return qs


class PayReportViewSet(viewsets.ModelViewSet):
    """
    Uses Supabase tables:
      - myapp_payreport (header)
      - myapp_payreportline (details)
    """
    queryset = PayReport.objects.select_related('driver').prefetch_related('lines')
    serializer_class = PayReportSerializer
    permission_classes = [IsManagerOrDriver]

    def get_queryset(self):
        qs = super().get_queryset()

        user = self.request.user
        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            driver = None
            for lookup in ("user", "account", "auth_user"):
                try:
                    driver = Driver.objects.filter(**{lookup: user}).first()
                    if driver:
                        break
                except (FieldError, TypeError, ValueError):
                    continue
            qs = qs.filter(driver=driver) if driver else qs.none()

        driver_id = self.request.query_params.get('driver_id')
        start     = self.request.query_params.get('start')
        end       = self.request.query_params.get('end')
        if driver_id and not (user and user.is_authenticated and user.groups.filter(name="Driver").exists()):
            qs = qs.filter(driver_id=driver_id)
        if start:
            qs = qs.filter(week_end__gte=start)
        if end:
            qs = qs.filter(week_start__lte=end)
        return qs

    def perform_create(self, serializer):
        pr = serializer.save(created_at=timezone.now(), updated_at=timezone.now())
        pr.recalc_from_lines()

    def perform_update(self, serializer):
        pr = serializer.save(updated_at=timezone.now())
        pr.recalc_from_lines()

    @extend_schema(
        request=inline_serializer(
            name='PayReportGenerateRequest',
            fields={
                'driver_id': serializers.IntegerField(),
                'week_start': serializers.DateField(),
                'week_end': serializers.DateField(),
            },
        ),
        responses=PayReportSerializer,
    )
    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Body:
        {
          "driver_id": 3,
          "week_start": "2025-08-04",
          "week_end":   "2025-08-10"
        }
        Creates header + daily lines (hours start at 0).
        """
        driver_id = request.data.get('driver_id')
        ws = parse_date(request.data.get('week_start'))
        we = parse_date(request.data.get('week_end'))

        user = request.user
        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            driver = None
            for lookup in ("user", "account", "auth_user"):
                try:
                    driver = Driver.objects.filter(**{lookup: user}).first()
                    if driver:
                        break
                except (FieldError, TypeError, ValueError):
                    continue
            if not driver or str(driver.id) != str(driver_id):
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        if not (driver_id and ws and we and we >= ws):
            return Response(
                {"detail": "driver_id, week_start, week_end required (week_end >= week_start)."},
                status=status.HTTP_400_BAD_REQUEST
            )
        exists = PayReport.objects.filter(driver_id=driver_id, week_start=ws, week_end=we).exists()
        if exists:
            return Response(
                {"detail": "Report already exists for this driver/week."},
                status=status.HTTP_409_CONFLICT  # same as 409
            )

        pr = PayReport.objects.create(
            driver_id=driver_id,
            week_start=ws, week_end=we,
            fuel_program=Decimal('0.00'),
            fuel_pilot_or_kt=Decimal('0.00'),
            fuel_surcharge=Decimal('0.00'),
            total_weight_or_hours=Decimal('0.00'),
            total_truck_paid=Decimal('0.00'),
            total_amount=Decimal('0.00'),
            total_due=Decimal('0.00'),
            created_at=timezone.now(),
            updated_at=timezone.now(),
        )

        # Active driver assignments overlapping the week
        assignments = JobDriverAssignment.objects.select_related(
            'job',
            'driver_truck__driver',
            'driver_truck__truck',
            'job__loading_address',
            'job__unloading_address'
        ).filter(
            driver_truck__driver_id=driver_id,
            assigned_at__date__lte=we
        ).filter(
            Q(unassigned_at__isnull=True) | Q(unassigned_at__date__gte=ws)
        )

        # Seed one line per day per assignment
        day = ws
        while day <= we:
            for a in assignments:
                PayReportLine.objects.create(
                    report=pr,
                    job=a.job,
                    date=day,
                    job_number=a.job.job_number,
                    truck_number=a.driver_truck.truck.truck_number,
                    trailer_number='',
                    loaded=(a.job.loading_address.location_name or str(a.job.loading_address)) if a.job.loading_address else '',
                    unloaded=(a.job.unloading_address.location_name or str(a.job.unloading_address)) if a.job.unloading_address else '',
                    weight_or_hour=Decimal('0.00'),
                    truck_paid=(getattr(a, 'rate', None) or Decimal('0.00')),
                    total=Decimal('0.00'),
                    trailer_rent=Decimal('0.00'),
                    broker_charge=Decimal('0.00'),
                    contractor_paid=Decimal('0.00'),
                    created_at=timezone.now(),
                )
            day += timedelta(days=1)

        pr.recalc_from_lines()
        return Response(self.get_serializer(pr).data, status=status.HTTP_201_CREATED)


class PayReportLineViewSet(viewsets.ModelViewSet):
    queryset = PayReportLine.objects.select_related('report', 'job')
    serializer_class = PayReportLineSerializer
    permission_classes = [IsManagerOrDriver]

    def get_queryset(self):
        qs = super().get_queryset()

        user = self.request.user
        if user and user.is_authenticated and user.groups.filter(name="Driver").exists():
            driver = None
            for lookup in ("user", "account", "auth_user"):
                try:
                    driver = Driver.objects.filter(**{lookup: user}).first()
                    if driver:
                        break
                except (FieldError, TypeError, ValueError):
                    continue
            qs = qs.filter(report__driver=driver) if driver else qs.none()

        report_id = self.request.query_params.get('report_id')
        job_id    = self.request.query_params.get('job_id')
        if report_id:
            qs = qs.filter(report_id=report_id)
        if job_id:
            qs = qs.filter(job_id=job_id)
        return qs

    def perform_create(self, serializer):
        line = serializer.save()
        if line.report:
            line.report.recalc_from_lines()

    def perform_update(self, serializer):
        line = serializer.save()  # model.save() recomputes totals
        line.report.recalc_from_lines()

def _recent_otp_count(user, minutes=15):
    since = timezone.now() - timedelta(minutes=minutes)
    return PasswordOTP.objects.filter(user=user, created_at__gte=since, purpose="password_reset").count()

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = RequestOTPSerializer

    def get_serializer_class(self):
        if self.action == 'verify_password_otp':
            return VerifyOTPSerializer
        if self.action == 'reset_password_with_otp':
            return ResetPasswordSerializer
        return RequestOTPSerializer

    @extend_schema(
        request=RequestOTPSerializer,
        responses=inline_serializer(
            name='PasswordResetRequestResponse',
            fields={
                'ok': serializers.BooleanField(),
                'message': serializers.CharField(),
            },
        ),
    )
    @action(detail=False, methods=["post"], url_path="password-reset")
    def request_password_otp(self, request):
        s = RequestOTPSerializer(data=request.data); s.is_valid(raise_exception=True)
        email = s.validated_data["email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user and _recent_otp_count(user) < 3:
            PasswordOTP.objects.filter(user=user, used=False, purpose="password_reset").update(used=True)
            otp, code = PasswordOTP.create_for_user(user, ttl_minutes=10)
            email_sent = send_password_otp_email(email, code, minutes=10)
            if not email_sent:
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Always return success to prevent email enumeration
        return Response({"ok": True, "message": "If an account exists with this email, a password reset code has been sent."})

    @extend_schema(
        request=VerifyOTPSerializer,
        responses=inline_serializer(
            name='PasswordResetVerifyResponse',
            fields={'valid': serializers.BooleanField()},
        ),
    )
    @action(detail=False, methods=["post"], url_path="password-reset/verify")
    def verify_password_otp(self, request):
        s = VerifyOTPSerializer(data=request.data); s.is_valid(raise_exception=True)
        email, code = s.validated_data["email"].lower(), s.validated_data["code"]
        user = User.objects.filter(email__iexact=email).first()
        if not user: return Response({"valid": False})
        otp = (PasswordOTP.objects
               .filter(user=user, purpose="password_reset", used=False)
               .order_by("-created_at").first())
        if otp and otp.code_hash == otp._hash(code, otp.salt): return Response({"valid": True})
        return Response({"valid": False})

    @extend_schema(
        request=ResetPasswordSerializer,
        responses=inline_serializer(
            name='PasswordResetConfirmResponse',
            fields={'ok': serializers.BooleanField()},
        ),
    )
    @action(detail=False, methods=["post"], url_path="password-reset/confirm")
    def reset_password_with_otp(self, request):
        s = ResetPasswordSerializer(data=request.data); s.is_valid(raise_exception=True)
        email, code, new_pw = s.validated_data["email"].lower(), s.validated_data["code"], s.validated_data["new_password"]
        user = User.objects.filter(email__iexact=email).first()
        if not user: return Response({"ok": True})
        otp = (PasswordOTP.objects
               .filter(user=user, purpose="password_reset", used=False)
               .order_by("-created_at").first())
        if not (otp and otp.verify(code)):
            from rest_framework import status
            return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_pw); user.save(update_fields=["password"])
        return Response({"ok": True})
