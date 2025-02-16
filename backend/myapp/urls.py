from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, CustomerViewSet, DriverViewSet, RoleViewSet, UserViewSet, UserRoleViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'userroles', UserRoleViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),  # Base API path
]
