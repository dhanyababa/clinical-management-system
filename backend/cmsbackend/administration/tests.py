


from django.test import TestCase
from django.contrib.auth.models import User
from datetime import date, timedelta
from rest_framework.test import APITestCase

from administration.models import (
    StaffProfile,
    DoctorProfile,
    ReceptionistProfile,
    LabTechnicianProfile,
    PharmacistProfile,
    AuditLog
)

from administration.serializers import (
    StaffProfileSerializer,
    DoctorProfileSerializer
)


# ------------------------------
# USER + STAFF TESTS
# ------------------------------
class StaffProfileTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="Test@1234",
            email="test@example.com"
        )

    def test_create_staff(self):
        staff = StaffProfile.objects.create(
            user=self.user,
            role="Doctor",
            date_of_birth=date.today() - timedelta(days=30 * 365),
            salary=50000
        )

        self.assertIsNotNone(staff.staff_code)
        self.assertTrue(staff.staff_code.startswith("DOC"))

    def test_invalid_dob(self):
        with self.assertRaises(Exception):
            StaffProfile.objects.create(
                user=self.user,
                role="Doctor",
                date_of_birth=date.today() + timedelta(days=1),
                salary=50000
            )

    def test_salary_validation(self):
        with self.assertRaises(Exception):
            StaffProfile.objects.create(
                user=self.user,
                role="Doctor",
                date_of_birth=date.today() - timedelta(days=30 * 365),
                salary=0
            )


# ------------------------------
# DOCTOR PROFILE TESTS
# ------------------------------
class DoctorProfileTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="doctor1",
            password="Test@1234"
        )

        self.staff = StaffProfile.objects.create(
            user=self.user,
            role="Doctor",
            date_of_birth=date.today() - timedelta(days=35 * 365),
            salary=60000
        )

    def test_create_doctor_profile(self):
        doctor = DoctorProfile.objects.create(
            staff=self.staff,
            specialization="Orthopedic",
            consultation_fee=500,
            experience_years=5
        )

        self.assertEqual(doctor.staff.role, "Doctor")

    def test_invalid_role(self):
        user2 = User.objects.create_user(username="rec1", password="Test@1234")

        staff2 = StaffProfile.objects.create(
            user=user2,
            role="Receptionist",
            date_of_birth=date.today() - timedelta(days=25 * 365),
            salary=20000
        )

        doctor = DoctorProfile(
            staff=staff2,
            specialization="General"
        )

        with self.assertRaises(Exception):
            doctor.full_clean()


# ------------------------------
# RECEPTIONIST TESTS
# ------------------------------
class ReceptionistTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="rec", password="123")

        self.staff = StaffProfile.objects.create(
            user=self.user,
            role="Receptionist",
            date_of_birth=date.today() - timedelta(days=25 * 365),
            salary=20000
        )

    def test_receptionist_creation(self):
        rec = ReceptionistProfile.objects.create(staff=self.staff)
        self.assertEqual(rec.staff.role, "Receptionist")


# ------------------------------
# LAB TECHNICIAN TESTS
# ------------------------------
class LabTechnicianTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="lab", password="123")

        self.staff = StaffProfile.objects.create(
            user=self.user,
            role="Lab Technician",
            date_of_birth=date.today() - timedelta(days=28 * 365),
            salary=25000
        )

    def test_labtech_creation(self):
        lab = LabTechnicianProfile.objects.create(
            staff=self.staff,
            certification_details="MLT"
        )

        self.assertEqual(lab.staff.role, "Lab Technician")


# ------------------------------
# PHARMACIST TESTS
# ------------------------------
class PharmacistTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="pharma", password="123")

        self.staff = StaffProfile.objects.create(
            user=self.user,
            role="Pharmacist",
            date_of_birth=date.today() - timedelta(days=30 * 365),
            salary=30000
        )

    def test_pharmacist_creation(self):
        pharma = PharmacistProfile.objects.create(
            staff=self.staff,
            license_number="LIC12345"
        )

        self.assertEqual(pharma.staff.role, "Pharmacist")


# ------------------------------
# AUDIT LOG TESTS
# ------------------------------
class AuditLogTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="admin", password="123")

    def test_audit_log_creation(self):
        log = AuditLog.objects.create(
            user=self.user,
            module="Staff",
            action="CREATE",
            description="Created staff"
        )

        self.assertEqual(log.action, "CREATE")


# ------------------------------
# SERIALIZER TESTS
# ------------------------------
class StaffSerializerTest(APITestCase):

    def test_create_staff_serializer(self):

        data = {
            "user": {
                "username": "newuser",
                "email": "new@example.com",
                "password": "StrongPass@123"
            },
            "role": "Doctor",
            "date_of_birth": str(date.today() - timedelta(days=30 * 365)),
            "salary": 50000
        }

        serializer = StaffProfileSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        staff = serializer.save()
        self.assertEqual(staff.role, "Doctor")


class DoctorSerializerTest(APITestCase):

    def test_create_doctor_serializer(self):

        data = {
            "staff": {
                "user": {
                    "username": "docserializer",
                    "email": "doc@example.com",
                    "password": "StrongPass@123"
                },
                "role": "Doctor",
                "date_of_birth": str(date.today() - timedelta(days=35 * 365)),
                "salary": 60000
            },
            "specialization": "Cardiology",
            "consultation_fee": 700,
            "experience_years": 5
        }

        serializer = DoctorProfileSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        doctor = serializer.save()
        self.assertEqual(doctor.specialization, "Cardiology")