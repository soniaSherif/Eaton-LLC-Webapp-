from rest_framework import serializers
from .models import Job, Customer, Driver, Role, User, UserRole, Comment, Truck, DriverTruckAssignment
from django.contrib.auth import get_user_model

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

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
        fields = '__all__'

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

class DriverTruckAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverTruckAssignment
        fields = '__all__'




User = get_user_model()  # ✅ Fetch the correct user model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email_address", "user_name", "password"]  
        extra_kwargs = {"password": {"write_only": True}}  

    def create(self, validated_data):
        user = User.objects.create_user(
            email_address=validated_data["email_address"],
            password=validated_data["password"],
            user_name=validated_data.get("user_name", ""),
        )
        return user

