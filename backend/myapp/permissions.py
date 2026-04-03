from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    message = "Access denied: Manager role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.groups.filter(name="Manager").exists()
        )


class IsDriver(BasePermission):
    message = "Access denied: Driver role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.groups.filter(name="Driver").exists()
        )


class IsManagerOrDriver(BasePermission):
    message = "Access denied: Manager or Driver role required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.groups.filter(name__in=["Manager", "Driver"]).exists()
