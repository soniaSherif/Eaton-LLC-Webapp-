from rest_framework import serializers
from .models import Job, Customer, Driver, Role, User, UserRole, Comment, Truck, DriverTruckAssignment, Operator, Address, JobDriverAssignment
from django.contrib.auth import get_user_model

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
            'id',
            'job',
            'driver_truck',       # POST this
            'driver_truck_info',  # GET this
            'assigned_at',
            'unassigned_at',
        ]
        read_only_fields = ['assigned_at', 'unassigned_at']
        
class JobSerializer(serializers.ModelSerializer):
    # Writeable FK fields:
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

    # Nested read-only info for GET responses:
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
        read_only_fields = ['created_at']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']  # Include any other fields you need
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




