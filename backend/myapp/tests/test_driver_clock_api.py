import pytest
from django.contrib.auth.models import Group


@pytest.mark.django_db
class TestDriverClockApi:
    def _grant_driver_role(self, test_driver):
        driver_group, _ = Group.objects.get_or_create(name='Driver')
        test_driver.user.groups.add(driver_group)

    def test_get_clock_status_returns_default(self, authenticated_api_client, test_driver):
        self._grant_driver_role(test_driver)
        response = authenticated_api_client.get('/api/drivers/clock-status/')

        assert response.status_code == 200
        assert response.data['is_clocked_in'] is False
        assert response.data['clocked_in'] is False
        assert response.data['last_clocked_in_at'] is None
        assert response.data['last_clocked_out_at'] is None

    def test_patch_clock_status_with_is_clocked_in(self, authenticated_api_client, test_driver):
        self._grant_driver_role(test_driver)
        response = authenticated_api_client.patch(
            '/api/drivers/clock-status/',
            {'is_clocked_in': True},
            format='json',
        )

        assert response.status_code == 200
        assert response.data['is_clocked_in'] is True
        assert response.data['clocked_in'] is True
        assert response.data['last_clocked_in_at'] is not None

        test_driver.refresh_from_db()
        assert test_driver.is_clocked_in is True
        assert test_driver.last_clocked_in_at is not None

    def test_post_clock_status_accepts_clocked_in_alias(self, authenticated_api_client, test_driver):
        self._grant_driver_role(test_driver)
        response = authenticated_api_client.post(
            '/api/drivers/clock-status/',
            {'clocked_in': False},
            format='json',
        )

        assert response.status_code == 200
        assert response.data['is_clocked_in'] is False

    def test_clock_in_and_clock_out_endpoints(self, authenticated_api_client, test_driver):
        self._grant_driver_role(test_driver)
        clock_in_response = authenticated_api_client.post('/api/drivers/clock-in/', {}, format='json')
        assert clock_in_response.status_code == 200
        assert clock_in_response.data['is_clocked_in'] is True

        clock_out_response = authenticated_api_client.post('/api/drivers/clock-out/', {}, format='json')
        assert clock_out_response.status_code == 200
        assert clock_out_response.data['is_clocked_in'] is False

        test_driver.refresh_from_db()
        assert test_driver.is_clocked_in is False
        assert test_driver.last_clocked_in_at is not None
        assert test_driver.last_clocked_out_at is not None
