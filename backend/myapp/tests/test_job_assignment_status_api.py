from datetime import timedelta

import pytest
from django.contrib.auth.models import Group
from django.utils.dateparse import parse_datetime
from django.utils import timezone

from myapp.models import JobDriverAssignment


@pytest.mark.django_db
class TestJobAssignmentStatusApi:
    @pytest.mark.parametrize(
        'new_status,expected_status,timestamp_field,response_field',
        [
            ('en_route', 'assigned', 'started_at', 'en_route_at'),
            ('on_site', 'en_route', 'on_site_at', 'on_site_at'),
            ('completed', 'on_site', 'completed_at', 'completed_at'),
        ],
    )
    def test_status_patch_uses_client_occurred_at_for_timestamps(
        self,
        authenticated_api_client,
        test_job,
        test_driver_truck_assignment,
        test_user,
        new_status,
        expected_status,
        timestamp_field,
        response_field,
    ):
        driver_group, _ = Group.objects.get_or_create(name='Driver')
        test_user.groups.add(driver_group)

        assignment = JobDriverAssignment.objects.create(
            job=test_job,
            driver_truck=test_driver_truck_assignment,
            status=expected_status,
        )

        occurred_at = '2026-04-22T14:00:00Z'
        occurred_at_dt = parse_datetime(occurred_at)

        response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {
                'status': new_status,
                'expected_status': expected_status,
                'occurred_at': occurred_at,
            },
            format='json',
        )

        assert response.status_code == 200
        assert response.data['status'] == new_status
        assert response.data[response_field] is not None
        assert parse_datetime(response.data[response_field]) == occurred_at_dt

        assignment.refresh_from_db()
        assert getattr(assignment, timestamp_field) == occurred_at_dt

    def test_status_patch_sets_en_route_timestamp_and_returns_it(
        self,
        authenticated_api_client,
        test_job,
        test_driver_truck_assignment,
        test_user,
    ):
        driver_group, _ = Group.objects.get_or_create(name='Driver')
        test_user.groups.add(driver_group)

        assignment = JobDriverAssignment.objects.create(
            job=test_job,
            driver_truck=test_driver_truck_assignment,
            status='assigned',
        )
        old_started_at = timezone.now() - timedelta(days=1)
        assignment.started_at = old_started_at
        assignment.save(update_fields=['started_at'])

        response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {'status': 'en_route', 'expected_status': 'assigned'},
            format='json',
        )

        assert response.status_code == 200
        assert response.data['status'] == 'en_route'
        assert response.data['started_at'] is not None
        assert response.data['en_route_at'] == response.data['started_at']

        assignment.refresh_from_db()
        assert assignment.started_at is not None
        assert assignment.started_at > old_started_at

    def test_status_patch_rejects_invalid_occurred_at(
        self,
        authenticated_api_client,
        test_job,
        test_driver_truck_assignment,
        test_user,
    ):
        driver_group, _ = Group.objects.get_or_create(name='Driver')
        test_user.groups.add(driver_group)

        assignment = JobDriverAssignment.objects.create(
            job=test_job,
            driver_truck=test_driver_truck_assignment,
            status='assigned',
        )

        response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {
                'status': 'en_route',
                'expected_status': 'assigned',
                'occurred_at': 'not-a-datetime',
            },
            format='json',
        )

        assert response.status_code == 400
        assert 'occurred_at' in response.data['error']

    def test_job_detail_reflects_updated_on_site_and_completed_timestamps(
        self,
        authenticated_api_client,
        test_job,
        test_driver_truck_assignment,
        test_user,
    ):
        driver_group, _ = Group.objects.get_or_create(name='Driver')
        test_user.groups.add(driver_group)

        assignment = JobDriverAssignment.objects.create(
            job=test_job,
            driver_truck=test_driver_truck_assignment,
            status='assigned',
        )

        en_route_response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {'status': 'en_route', 'expected_status': 'assigned'},
            format='json',
        )
        assert en_route_response.status_code == 200

        on_site_response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {'status': 'on_site', 'expected_status': 'en_route'},
            format='json',
        )
        assert on_site_response.status_code == 200

        completed_response = authenticated_api_client.patch(
            f'/api/job-driver-assignments/{assignment.id}/status/',
            {'status': 'completed', 'expected_status': 'on_site'},
            format='json',
        )
        assert completed_response.status_code == 200

        job_detail_response = authenticated_api_client.get(f'/api/jobs/{test_job.id}/')

        assert job_detail_response.status_code == 200
        assert len(job_detail_response.data['driver_assignments']) == 1

        assignment_payload = job_detail_response.data['driver_assignments'][0]
        assert assignment_payload['status'] == 'completed'
        assert assignment_payload['en_route_at'] is not None
        assert assignment_payload['on_site_at'] is not None
        assert assignment_payload['completed_at'] is not None
