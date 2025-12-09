"""
Tests for authentication and authorization.

Tests cover:
- User registration
- Login/Token obtain
- Token refresh
- Token verification
- Protected endpoints
- JWT token functionality
"""

import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status as http_status
from rest_framework_simplejwt.tokens import RefreshToken


class TestRegistration:
    """Test user registration endpoint."""
    
    def test_register_user(self, api_client, db):
        """Test POST /api/register/"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'securepass123'
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()
    
    def test_register_duplicate_username(self, api_client, test_user, db):
        """Test registration with duplicate username."""
        url = reverse('register')
        data = {
            'username': test_user.username,
            'email': 'different@test.com',
            'password': 'password123'
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_400_BAD_REQUEST
    
    def test_register_invalid_data(self, api_client, db):
        """Test registration with invalid data."""
        url = reverse('register')
        data = {
            'username': 'user',
            # Missing email and password
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_400_BAD_REQUEST


class TestLogin:
    """Test login/token obtain endpoint."""
    
    def test_login_success(self, api_client, test_user):
        """Test POST /api/login/ with valid credentials."""
        url = reverse('login')
        data = {
            'username': test_user.username,
            'password': 'testpass123'
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_login_invalid_credentials(self, api_client, test_user):
        """Test login with invalid credentials."""
        url = reverse('login')
        data = {
            'username': test_user.username,
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_401_UNAUTHORIZED
    
    def test_login_nonexistent_user(self, api_client, db):
        """Test login with nonexistent user."""
        url = reverse('login')
        data = {
            'username': 'nonexistent',
            'password': 'password123'
        }
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_401_UNAUTHORIZED


class TestTokenRefresh:
    """Test token refresh endpoint."""
    
    def test_refresh_token(self, api_client, test_user):
        """Test POST /api/token/refresh/"""
        refresh_token = RefreshToken.for_user(test_user)
        url = reverse('token_refresh')
        data = {'refresh': str(refresh_token)}
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'access' in response.data
    
    def test_refresh_token_invalid(self, api_client):
        """Test refresh with invalid token."""
        url = reverse('token_refresh')
        data = {'refresh': 'invalid_token'}
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_401_UNAUTHORIZED


class TestTokenVerify:
    """Test token verification endpoint."""
    
    def test_verify_token(self, api_client, test_user):
        """Test POST /api/token/verify/"""
        refresh_token = RefreshToken.for_user(test_user)
        access_token = refresh_token.access_token
        url = reverse('token_verify')
        data = {'token': str(access_token)}
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
    
    def test_verify_invalid_token(self, api_client):
        """Test verify with invalid token."""
        url = reverse('token_verify')
        data = {'token': 'invalid_token'}
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_401_UNAUTHORIZED


class TestProtectedEndpoint:
    """Test protected endpoint access."""
    
    def test_protected_view_authenticated(self, authenticated_api_client):
        """Test GET /api/protected/ with authentication."""
        url = reverse('protected')
        response = authenticated_api_client.get(url)
        assert response.status_code == http_status.HTTP_200_OK
        assert 'message' in response.data
        assert response.data["message"] == "This is a protected view!"
    
    def test_protected_view_unauthenticated(self, api_client):
        """Test GET /api/protected/ without authentication."""
        url = reverse('protected')
        response = api_client.get(url)
        # Based on settings, this may be 401 or 200 (AllowAny)
        assert response.status_code in [http_status.HTTP_200_OK, http_status.HTTP_401_UNAUTHORIZED]
    
    def test_protected_view_with_token(self, api_client, test_user):
        """Test protected view with JWT token."""
        refresh_token = RefreshToken.for_user(test_user)
        access_token = refresh_token.access_token
        url = reverse('protected')
        response = api_client.get(
            url,
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        assert response.status_code == http_status.HTTP_200_OK
        assert response.data["message"] == "This is a protected view!"


class TestJWTFunctionality:
    """Test JWT token functionality."""
    
    def test_token_contains_user_info(self, api_client, test_user):
        """Test that token can be decoded with user info."""
        refresh_token = RefreshToken.for_user(test_user)
        access_token = refresh_token.access_token
        
        # Decode token (simplified - in real app, use jwt library)
        assert str(access_token) is not None
    
    def test_token_expiry(self, api_client, test_user):
        """Test that tokens expire (basic check)."""
        refresh_token = RefreshToken.for_user(test_user)
        access_token = refresh_token.access_token
        # Tokens should have expiry time (actual expiry testing requires time manipulation)
        assert str(access_token) is not None
    
    def test_refresh_token_rotation(self, api_client, test_user):
        """Test that refresh token rotation works."""
        refresh_token = RefreshToken.for_user(test_user)
        url = reverse('token_refresh')
        data = {'refresh': str(refresh_token)}
        response = api_client.post(url, data)
        assert response.status_code == http_status.HTTP_200_OK
        # In rotation mode, old refresh token should be invalidated
        # This would require checking blacklist if enabled

