


from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User, Group

from administration.models import StaffProfile, DoctorProfile
from reception.models import Patient, Appointment
from doctor.models import Consultation, Prescription, LabTestRequest
from pharmacist.models import Medicine
from labtechnician.models import LabTest


# =====================================================
# BASE TEST CASE (COMMON SETUP)
# =====================================================
class BaseTestCase(TestCase):

    def setUp(self):

        # User
        self.user = User.objects.create(username="doctor1")

        doctor_group, _ = Group.objects.get_or_create(name="Doctor")
        self.user.groups.add(doctor_group)

        # Doctor
        self.staff = StaffProfile.objects.create(
            user=self.user,
            role="Doctor",
            phone="+911234567890"
        )

        self.doctor = DoctorProfile.objects.create(
            staff=self.staff,
            specialization="General"
        )

        # Patient
        self.patient = Patient.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@test.com",
            phone="9999999999",
            date_of_birth=timezone.now().date() - timedelta(days=10000),
            gender="Male",
            address="Test Address"
        )

    # ✅ Always future appointment
    def create_future_appointment(self):
        now = timezone.now()

        return Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=now.date(),
            appointment_time=(now + timedelta(minutes=30)).time(),
            token_number=1,
            reason="Fever",
            status="Scheduled"
        )


# =====================================================
# CONSULTATION TESTS
# =====================================================
class ConsultationAPITest(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.appointment = self.create_future_appointment()

    def test_create_consultation(self):

        data = {
            "appointment": self.appointment.appointment_id,
            "symptoms": "High fever",
            "diagnosis": "Viral fever",
            "vitals": "Normal BP",
            "advice": "Rest"
        }

        response = self.client.post("/doctor/consultations/", data)
        self.assertEqual(response.status_code, 201)

    def test_duplicate_consultation(self):

        Consultation.objects.create(
            appointment=self.appointment,
            symptoms="Fever",
            diagnosis="Viral",
            vitals="Normal"
        )

        data = {
            "appointment": self.appointment.appointment_id,
            "symptoms": "High fever",
            "diagnosis": "Viral fever",
            "vitals": "Normal BP",
            "advice": "Rest"
        }

        response = self.client.post("/doctor/consultations/", data)
        self.assertEqual(response.status_code, 400)

    def test_cancelled_appointment(self):

        self.appointment.status = "Cancelled"
        self.appointment.save()

        data = {
            "appointment": self.appointment.appointment_id,
            "symptoms": "Fever",
            "diagnosis": "Viral",
            "vitals": "Normal"
        }

        response = self.client.post("/doctor/consultations/", data)
        self.assertEqual(response.status_code, 400)


# =====================================================
# LAB TEST REQUEST
# =====================================================
class LabRequestAPITest(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.appointment = self.create_future_appointment()

        self.consultation = Consultation.objects.create(
            appointment=self.appointment,
            symptoms="Fever",
            diagnosis="Viral",
            vitals="Normal"
        )

        self.lab_test = LabTest.objects.create(
            test_name="Blood Test",
            cost=500
        )

    def test_create_lab_request(self):

        data = {
            "consultation": self.consultation.id,
            "doctor": self.doctor.doctor_id,
            "notes": "Check infection",
            "tests": [
                {"lab_test": self.lab_test.test_id}
            ]
        }

        response = self.client.post(
            "/doctor/lab-test-request/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 201)

    def test_duplicate_lab_request(self):

        LabTestRequest.objects.create(
            consultation=self.consultation,
            doctor=self.doctor,
            notes="Test"
        )

        data = {
            "consultation": self.consultation.id,
            "doctor": self.doctor.doctor_id,
            "tests": [
                {"lab_test": self.lab_test.test_id}
            ]
        }

        response = self.client.post(
            "/doctor/lab-test-request/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 400)


# =====================================================
# PRESCRIPTION TESTS
# =====================================================
class PrescriptionAPITest(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.appointment = self.create_future_appointment()

        self.consultation = Consultation.objects.create(
            appointment=self.appointment,
            symptoms="Fever",
            diagnosis="Viral",
            vitals="Normal"
        )

        self.medicine = Medicine.objects.create(
            name="Paracetamol",
            price=10
        )

    def test_create_prescription(self):

        data = {
            "consultation": self.consultation.id,
            "doctor": self.doctor.doctor_id,
            "items": [
                {
                    "medicine_name": self.medicine.medicine_id,
                    "dosage": "500mg",
                    "frequency": "2 times",
                    "duration": 5
                }
            ]
        }

        response = self.client.post(
            "/doctor/prescriptions/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 201)

    def test_duplicate_prescription(self):

        Prescription.objects.create(
            consultation=self.consultation,
            doctor=self.doctor
        )

        data = {
            "consultation": self.consultation.id,
            "doctor": self.doctor.doctor_id,
            "items": [
                {
                    "medicine_name": self.medicine.medicine_id,
                    "dosage": "500mg",
                    "frequency": "2 times",
                    "duration": 5
                }
            ]
        }

        response = self.client.post(
            "/doctor/prescriptions/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_prescription_blocked_by_lab(self):

        LabTestRequest.objects.create(
            consultation=self.consultation,
            doctor=self.doctor,
            status="Pending"
        )

        data = {
            "consultation": self.consultation.id,
            "doctor": self.doctor.doctor_id,
            "items": [
                {
                    "medicine_name": self.medicine.medicine_id,
                    "dosage": "500mg",
                    "frequency": "2 times",
                    "duration": 5
                }
            ]
        }

        response = self.client.post(
            "/doctor/prescriptions/",
            data,
            format="json"
        )

        self.assertEqual(response.status_code, 400)