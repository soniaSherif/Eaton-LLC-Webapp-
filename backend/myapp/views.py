from django.http import HttpResponse
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.db.models import Q, Prefetch

from django.contrib.auth import get_user_model
from .models import (
    Job, Customer, Driver, Role, UserRole, Comment, Truck, DriverTruckAssignment, Operator, Address, JobDriverAssignment,Invoice, InvoiceLine
)
from .serializers import (
    JobSerializer, CustomerSerializer, DriverSerializer, RoleSerializer,
    UserSerializer, UserRoleSerializer, CommentSerializer, TruckSerializer,
    DriverTruckAssignmentSerializer, OperatorSerializer, AddressSerializer, JobDriverAssignmentSerializer,InvoiceSerializer, InvoiceLineSerializer
)

# For user model
User = get_user_model()

# Basic test view
def home(request):
    return HttpResponse("Hello, this is the home page!")


# ViewSets for basic CRUD APIs
class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related(
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
            # Filter jobs by customer through invoices (since Invoice has both customer and job FKs)
            qs = qs.filter(invoices__customer_id=customer_id).distinct()
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
    
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class TruckViewSet(viewsets.ModelViewSet):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class DriverTruckAssignmentViewSet(viewsets.ModelViewSet):
    queryset = DriverTruckAssignment.objects.all()
    serializer_class = DriverTruckAssignmentSerializer

# Authentication views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.all()
    serializer_class = OperatorSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class CustomTokenRefreshView(TokenRefreshView):
    pass

# Protected test endpoint
@api_view(["GET"])
def protected_view(request):
    return Response({"message": "This is a protected view!"}, status=status.HTTP_200_OK)

# API: Assign a truck to a driver
@api_view(["POST"])
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
def drivers_and_trucks(request):
    drivers = Driver.objects.all()
    trucks = Truck.objects.all()
    driver_data = DriverSerializer(drivers, many=True).data
    truck_data = TruckSerializer(trucks, many=True).data
    return Response({
        "drivers": driver_data,
        "trucks": truck_data
    })

@api_view(['GET'])
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

    def get_queryset(self):
        qs = (Invoice.objects
              .select_related("customer", "job")
              .prefetch_related(Prefetch("lines", queryset=InvoiceLine.objects.all()))
              .order_by("-id"))

        customer = self.request.query_params.get("customer")
        project  = self.request.query_params.get("project")
        status_  = self.request.query_params.get("status")
        date     = self.request.query_params.get("date")

        if customer:
            qs = qs.filter(customer__company_name__icontains=customer)
        if project:
            # adjust if your job/project field is named differently
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