from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, CustomerViewSet, DriverViewSet, RoleViewSet, UserViewSet, UserRoleViewSet, CommentViewSet
from .views import RegisterView, CustomTokenObtainPairView, CustomTokenRefreshView, protected_view
from rest_framework_simplejwt.views import TokenVerifyView


router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'userroles', UserRoleViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),  
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('protected/', protected_view, name='protected'),
]
