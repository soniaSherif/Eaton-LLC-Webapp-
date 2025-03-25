from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView

from . import views
from .views import (
    JobViewSet, CustomerViewSet, DriverViewSet, RoleViewSet,
    UserViewSet, UserRoleViewSet, CommentViewSet, TruckViewSet,
    DriverTruckAssignmentViewSet, RegisterView, CustomTokenObtainPairView,
    CustomTokenRefreshView, protected_view, assign_truck_to_driver
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'userroles', UserRoleViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'trucks', TruckViewSet)
router.register(r'driver-truck-assignments', DriverTruckAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),  
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('protected/', protected_view, name='protected'),
    path('assign-truck/', assign_truck_to_driver, name='assign_truck'),
]
