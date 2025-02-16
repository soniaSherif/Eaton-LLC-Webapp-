from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Route for http://127.0.0.1:8000/myapp/
]
