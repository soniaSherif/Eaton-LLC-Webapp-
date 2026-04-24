"""Integration tests for driver jobs filtering endpoint."""

from datetime import date, timedelta

import pytest
from django.contrib.auth.models import Group, User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from myapp.models import Driver, DriverTruckAssignment, Job, JobDriverAssignment


@pytest.mark.django_db
class TestDriverJobsFilteringIntegration:
    """Test filtering behavior for GET /api/drivers/me/jobs/."""

    @pytest.fixture
    def driver_group(self):
        group, _ = Group.objects.get_or_create(name="Driver")
        return group

    @pytest.fixture
    def primary_driver_user(self, driver_group):
        user = User.objects.create_user(
            username="driver_user",
            email="driver_user@example.com",
            password="testpass123",
        )
        user.groups.add(driver_group)
        return user

    @pytest.fixture
    def secondary_driver_user(self, driver_group):
        user = User.objects.create_user(
            username="other_driver",
            email="other_driver@example.com",
            password="testpass123",
        )
        user.groups.add(driver_group)
        return user

    @pytest.fixture
    def primary_driver(self, primary_driver_user, test_operator):
        return Driver.objects.create(
            user=primary_driver_user,
            operator=test_operator,
            name="Primary Driver",
            email_address="primary@example.com",
            phone_number="555-1000",
            driver_license="DL-PRIMARY",
            contact_info="Primary contact",
            address="123 Primary St",
        )

    @pytest.fixture
    def secondary_driver(self, secondary_driver_user, test_operator):
        return Driver.objects.create(
            user=secondary_driver_user,
            operator=test_operator,
            name="Secondary Driver",
            email_address="secondary@example.com",
            phone_number="555-2000",
            driver_license="DL-SECONDARY",
            contact_info="Secondary contact",
            address="456 Secondary St",
        )

    @staticmethod
    def _create_job(test_address, job_number, job_date):
        return Job.objects.create(
            project=f"Project {job_number}",
            prime_contractor="Prime Contractor Co",
            prime_contractor_project_number=f"PC-{job_number}",
            contractor_invoice=f"INV-{job_number}",
            contractor_invoice_project_number=f"CIPN-{job_number}",
            prevailing_or_not="No",
            job_description=f"Job for {job_number}",
            job_number=job_number,
            material="Gravel",
            job_date=job_date,
            shift_start=timezone.now().time().replace(hour=8, minute=0),
            loading_address=test_address,
            unloading_address=test_address,
            job_foreman_name="Foreman",
            job_foreman_contact="555-9999",
        )

    @pytest.fixture
    def assigned_jobs(self, primary_driver, secondary_driver, test_truck, test_address):
        today = date.today()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        primary_active_assignment = DriverTruckAssignment.objects.create(
            driver=primary_driver,
            truck=test_truck,
        )
        primary_inactive_assignment = DriverTruckAssignment.objects.create(
            driver=primary_driver,
            truck=test_truck,
            unassigned_at=timezone.now(),
        )
        secondary_active_assignment = DriverTruckAssignment.objects.create(
            driver=secondary_driver,
            truck=test_truck,
        )

        past_active_job = self._create_job(test_address, "JOB-PAST-ACTIVE", yesterday)
        today_active_job = self._create_job(test_address, "JOB-TODAY-ACTIVE", today)
        future_active_job = self._create_job(test_address, "JOB-FUTURE-ACTIVE", tomorrow)

        past_job_for_upcoming_exclusion = self._create_job(
            test_address,
            "JOB-PAST-EXCLUDE",
            yesterday,
        )
        inactive_job_assignment_job = self._create_job(
            test_address,
            "JOB-INACTIVE-JA",
            today,
        )
        inactive_truck_assignment_job = self._create_job(
            test_address,
            "JOB-INACTIVE-TRUCK",
            today,
        )
        other_driver_job = self._create_job(test_address, "JOB-OTHER-DRIVER", today)

        JobDriverAssignment.objects.create(
            job=past_active_job,
            driver_truck=primary_active_assignment,
        )
        JobDriverAssignment.objects.create(
            job=today_active_job,
            driver_truck=primary_active_assignment,
        )
        JobDriverAssignment.objects.create(
            job=future_active_job,
            driver_truck=primary_active_assignment,
        )

        JobDriverAssignment.objects.create(
            job=past_job_for_upcoming_exclusion,
            driver_truck=primary_active_assignment,
        )
        JobDriverAssignment.objects.create(
            job=inactive_job_assignment_job,
            driver_truck=primary_active_assignment,
            unassigned_at=timezone.now(),
        )
        JobDriverAssignment.objects.create(
            job=inactive_truck_assignment_job,
            driver_truck=primary_inactive_assignment,
        )
        JobDriverAssignment.objects.create(
            job=other_driver_job,
            driver_truck=secondary_active_assignment,
        )

        return {
            "today": today,
            "yesterday": yesterday,
            "tomorrow": tomorrow,
            "past_active_job": past_active_job,
            "today_active_job": today_active_job,
            "future_active_job": future_active_job,
            "past_job_for_upcoming_exclusion": past_job_for_upcoming_exclusion,
            "inactive_job_assignment_job": inactive_job_assignment_job,
            "inactive_truck_assignment_job": inactive_truck_assignment_job,
            "other_driver_job": other_driver_job,
        }

    def test_jobs_returns_only_active_assignments_for_authenticated_driver(
        self,
        api_client,
        primary_driver_user,
        assigned_jobs,
    ):
        api_client.force_authenticate(user=primary_driver_user)

        response = api_client.get(reverse("driver-jobs"))

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {job["id"] for job in response.data}

        expected_ids = {
            assigned_jobs["past_active_job"].id,
            assigned_jobs["today_active_job"].id,
            assigned_jobs["future_active_job"].id,
            assigned_jobs["past_job_for_upcoming_exclusion"].id,
        }

        excluded_ids = {
            assigned_jobs["inactive_job_assignment_job"].id,
            assigned_jobs["inactive_truck_assignment_job"].id,
            assigned_jobs["other_driver_job"].id,
        }

        assert returned_ids == expected_ids
        assert returned_ids.isdisjoint(excluded_ids)

    def test_jobs_filters_by_exact_date(self, api_client, primary_driver_user, assigned_jobs):
        api_client.force_authenticate(user=primary_driver_user)

        response = api_client.get(
            reverse("driver-jobs"),
            {"date": assigned_jobs["today"].isoformat()},
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {job["id"] for job in response.data}
        assert returned_ids == {assigned_jobs["today_active_job"].id}

    def test_jobs_filters_upcoming_when_requested(
        self,
        api_client,
        primary_driver_user,
        assigned_jobs,
    ):
        api_client.force_authenticate(user=primary_driver_user)

        response = api_client.get(reverse("driver-jobs"), {"upcoming": "true"})

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {job["id"] for job in response.data}
        assert returned_ids == {
            assigned_jobs["today_active_job"].id,
            assigned_jobs["future_active_job"].id,
        }
        assert assigned_jobs["past_active_job"].id not in returned_ids
        assert assigned_jobs["past_job_for_upcoming_exclusion"].id not in returned_ids

    def test_date_filter_takes_precedence_over_upcoming(
        self,
        api_client,
        primary_driver_user,
        assigned_jobs,
    ):
        api_client.force_authenticate(user=primary_driver_user)

        response = api_client.get(
            reverse("driver-jobs"),
            {
                "date": assigned_jobs["yesterday"].isoformat(),
                "upcoming": "true",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {job["id"] for job in response.data}
        assert returned_ids == {
            assigned_jobs["past_active_job"].id,
            assigned_jobs["past_job_for_upcoming_exclusion"].id,
        }

    def test_jobs_returns_404_when_authenticated_user_has_no_driver_profile(
        self,
        api_client,
        driver_group,
    ):
        user_without_profile = User.objects.create_user(
            username="driver_without_profile",
            email="driver_without_profile@example.com",
            password="testpass123",
        )
        user_without_profile.groups.add(driver_group)
        api_client.force_authenticate(user=user_without_profile)

        response = api_client.get(reverse("driver-jobs"))

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "No driver profile found for this user."