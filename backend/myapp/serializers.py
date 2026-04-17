from rest_framework import serializers
from decimal import Decimal
from django.contrib.auth import get_user_model

from .models import (
    Job,
    Customer,
    Driver,
    Role,
    UserRole,
    Comment,
    Truck,
    DriverTruckAssignment,
    Operator,
    Address,
    JobDriverAssignment,
    DeviceToken,
    Invoice,
    InvoiceLine,
    PayReport,
    PayReportLine
)

User = get_user_model()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class DriverTruckAssignmentSerializer(serializers.ModelSerializer):
    driver = serializers.StringRelatedField()
    truck_type = serializers.CharField(
                     source='truck.truck_type',
                     read_only=True
                 )
    driver_phone = serializers.CharField(
        source='driver.phone_number',
        read_only=True
    )
    
    class Meta:
        model  = DriverTruckAssignment
        fields = ['id', 'driver', 'truck_type', 'driver_phone', 'assigned_at', 'unassigned_at']

class JobDriverAssignmentSerializer(serializers.ModelSerializer):
    # writable foreign key
    driver_truck = serializers.PrimaryKeyRelatedField(
        queryset=DriverTruckAssignment.objects.all()
    )
    # nested info for GETs
    driver_truck_info = DriverTruckAssignmentSerializer(
        source='driver_truck',
        read_only=True
    )

    class Meta:
        model  = JobDriverAssignment
        fields = [
        'id', 'job', 'driver_truck', 'driver_truck_info',
        'assigned_at', 'unassigned_at',
        'status', 'started_at', 'completed_at',
        ]
        read_only_fields = ['assigned_at', 'unassigned_at', 'started_at', 'completed_at']

        
class JobSerializer(serializers.ModelSerializer):
    # Writeable FK fields:
    prime_contractor_customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), allow_null=True, required=False
    )
    prime_contractor_name = serializers.CharField(
        source='prime_contractor_customer.company_name', read_only=True
    )

    loading_address           = serializers.PrimaryKeyRelatedField(
                                    queryset=Address.objects.all()
                                )
    unloading_address         = serializers.PrimaryKeyRelatedField(
                                    queryset=Address.objects.all()
                                )
    backhaul_loading_address   = serializers.PrimaryKeyRelatedField(
                                    queryset=Address.objects.all(),
                                    required=False,
                                    allow_null=True
                                )
    backhaul_unloading_address = serializers.PrimaryKeyRelatedField(
                                    queryset=Address.objects.all(),
                                    required=False,
                                    allow_null=True
                                )

    loading_address_info           = AddressSerializer(source='loading_address', read_only=True)
    unloading_address_info         = AddressSerializer(source='unloading_address', read_only=True)
    backhaul_loading_address_info   = AddressSerializer(source='backhaul_loading_address', read_only=True)
    backhaul_unloading_address_info = AddressSerializer(source='backhaul_unloading_address', read_only=True)
    driver_assignments = JobDriverAssignmentSerializer(
      many=True,
      read_only=True
    )

    class Meta:
        model = Job
        fields = [
            'id',
            'prime_contractor_customer',
            'prime_contractor_name',
            'project',
            'prime_contractor',
            'prime_contractor_project_number',
            'contractor_invoice',
            'new_contractor_invoice',
            'contractor_invoice_project_number',
            'new_contractor_invoice_project_number',
            'prevailing_or_not',
            'sap_or_sp_number',
            'report_requirement',
            'contract_number',
            'prevailing_wage_class_codes',
            'project_id',
            'job_description',
            'job_number',
            'material',
            'truck_types',
            'job_date',
            'shift_start',
            # writeable PKs
            'loading_address',
            'unloading_address',
            'backhaul_loading_address',
            'backhaul_unloading_address',
            # nested info
            'loading_address_info',
            'unloading_address_info',
            'backhaul_loading_address_info',
            'backhaul_unloading_address_info',
            'is_backhaul_enabled',
            'job_foreman_name',
            'job_foreman_contact',
            'additional_notes',
            'driver_assignments',
            'created_at',
        ]
        read_only_fields = ['created_at', 'prime_contractor_name']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'
        
class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']  
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password) 
        user.save()
        return user

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = '__all__'


        
class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = '__all__'


class InvoiceLineSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    amount = serializers.SerializerMethodField(read_only=True)
    invoice = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = InvoiceLine
        fields = ["id", "invoice", "description", "service_date", "quantity", "unit_price", "amount"]

    def get_amount(self, obj) -> float:
        qty = obj.quantity or 0
        price = obj.unit_price or 0
        return float(qty) * float(price)


class InvoiceSerializer(serializers.ModelSerializer):
    # Writeable FK fields for POST/PATCH
    customer_id = serializers.IntegerField(write_only=True)
    job_id = serializers.IntegerField(allow_null=True, required=False, write_only=True)
    lines = InvoiceLineSerializer(many=True, required=False)
    
    customer = CustomerSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_no",
            "invoice_date",
            "start_date",
            "end_date",
            "status",
            "total_amount",
            "customer_id",
            "job_id",
            "customer",      # nested read-only
            "job",           # nested read-only
            "lines",
        ]
        read_only_fields = ["id", "total_amount", "invoice_no"]

    def create(self, validated_data):
        # pop nested lines (coming from `source="lines"`)
        lines_data = validated_data.pop("lines", [])
        # Get customer and job objects for the invoice
        customer_id = validated_data.pop("customer_id")
        job_id = validated_data.pop("job_id", None)
        start_date = validated_data.get("start_date")
        end_date = validated_data.get("end_date")
        
        from .models import Customer, Job, JobDriverAssignment, InvoiceLine
        customer = Customer.objects.get(id=customer_id)
        # Job is required in the model, so we must have a job_id
        if not job_id:
            raise serializers.ValidationError({"job_id": "Job is required for creating an invoice."})
        job = Job.objects.get(id=job_id)

        request = self.context.get("request")
        user = getattr(request, "user", None)
        submitted_by_driver = None
        if user and user.is_authenticated:
            submitted_by_driver = Driver.objects.filter(user=user).first()
        if user and user.groups.filter(name="Driver").exists() and not submitted_by_driver:
            raise serializers.ValidationError(
                {"driver": "Driver profile missing for this user. Contact admin to link Driver record."}
            )


        invoice = Invoice.objects.create(
            customer=customer,
            job=job,
            submitted_by_driver=submitted_by_driver,
            **validated_data
        )

        # If no lines provided and date range exists, auto-populate from job data within date range
        if not lines_data and start_date and end_date:
            from datetime import date as date_type
            
            # Check if job itself falls within the date range
            if job.job_date and start_date <= job.job_date <= end_date:
                # Create invoice line from job data
                lines_data.append({
                    'description': job.job_description or f"{job.project} - {job.job_number}",
                    'service_date': job.job_date,
                    'quantity': Decimal('1.00'),
                    'unit_price': Decimal('0.00')  # Will need to be set manually or from job data
                })
            
            # Filter job driver assignments that were performed within the date range
            job_assignments = JobDriverAssignment.objects.filter(
                job=job
            ).select_related('driver_truck__driver', 'driver_truck__truck')
            
            # Create lines from job driver assignments that fall within the range
            for assignment in job_assignments:
                # Use assigned_at date as service date, or job_date if assigned_at is not available
                if assignment.assigned_at:
                    service_date = assignment.assigned_at.date()
                else:
                    service_date = job.job_date
                
                # Only include if service date falls within the invoice date range
                if start_date <= service_date <= end_date:
                    driver_name = assignment.driver_truck.driver.name if assignment.driver_truck.driver else "Unknown Driver"
                    truck_number = assignment.driver_truck.truck.truck_number if assignment.driver_truck.truck else "Unknown Truck"
                    
                    lines_data.append({
                        'description': f"{job.job_number} - {driver_name} - {truck_number}",
                        'service_date': service_date,
                        'quantity': Decimal('1.00'),  # Default quantity
                        'unit_price': Decimal('0.00')  # Will need to be set manually
                    })

        for line in lines_data:
            InvoiceLine.objects.create(invoice=invoice, **line)

        invoice.recalc_totals()

        # Return the serialized invoice instance so nested customer and job data are included
        # DRF will automatically serialize this using the InvoiceSerializer
        return invoice

    def update(self, instance, validated_data):
        # Handle line updates
        lines_data = validated_data.pop("lines", None)
        
        # Update header fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        
        # Update lines if provided
        if lines_data is not None:
            # Get existing line IDs that should be kept
            existing_line_ids = {line.id for line in instance.lines.all()}
            incoming_line_ids = {line.get('id') for line in lines_data if line.get('id') and isinstance(line.get('id'), int)}
            
            # Delete lines that are not in the incoming data
            if incoming_line_ids:
                instance.lines.exclude(id__in=incoming_line_ids).delete()
            else:
                # If no valid IDs, delete all existing lines (full replace)
                instance.lines.all().delete()
            
            # Update or create lines
            for line_data in lines_data:
                line_id = line_data.pop('id', None)
                # Only update if ID exists and is a valid integer in the database
                if line_id and isinstance(line_id, int) and line_id in existing_line_ids:
                    try:
                        # Update existing line
                        line = instance.lines.get(id=line_id)
                        for attr, val in line_data.items():
                            setattr(line, attr, val)
                        line.save()
                    except InvoiceLine.DoesNotExist:
                        # ID doesn't exist, create new line
                        InvoiceLine.objects.create(invoice=instance, **line_data)
                else:
                    # Create new line (no ID or invalid ID)
                    InvoiceLine.objects.create(invoice=instance, **line_data)
            
            instance.recalc_totals()
        
        return instance

class PayReportLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayReportLine
        fields = [
            'id', 'report', 'job', 'date',
            'job_number', 'truck_number', 'trailer_number',
            'loaded', 'unloaded',
            'weight_or_hour', 'truck_paid',
            'total', 'contractor_paid',
            'trailer_rent', 'broker_charge',
            'created_at',
        ]
        read_only_fields = ['id', 'total', 'contractor_paid', 'created_at']

class PayReportSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    lines = PayReportLineSerializer(many=True, read_only=True)

    class Meta:
        model = PayReport
        fields = [
            'id', 'driver', 'driver_name',
            'week_start', 'week_end',
            'fuel_program', 'fuel_pilot_or_kt', 'fuel_surcharge',
            'total_weight_or_hours', 'total_truck_paid', 'total_amount', 'total_due',
            'created_at', 'updated_at',
            'lines',
        ]
        read_only_fields = [
            'id',
            'total_weight_or_hours', 'total_truck_paid', 'total_amount', 'total_due',
            'created_at', 'updated_at',
        ]
    def validate(self, attrs):
            ws = attrs.get('week_start', getattr(self.instance, 'week_start', None))
            we = attrs.get('week_end',   getattr(self.instance, 'week_end',   None))
            if ws and we and we < ws:
                raise serializers.ValidationError({"week_end": "must be on/after week_start"})
            return attrs

class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(r"^\d{6}$")

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(r"^\d{6}$")
    new_password = serializers.CharField(min_length=8, write_only=True)


