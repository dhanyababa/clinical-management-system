

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from django.db.models.deletion import ProtectedError
from .models import (
    Medicine, MedicineBatch, Dispense, DispenseItem, MedicineBill, MedicineStockLog
)
from .serializers import (
    MedicineSerializer, MedicineBatchSerializer, DispenseSerializer,
    DispenseItemSerializer, MedicineBillSerializer, MedicineStockLogSerializer,
    IncomingPrescriptionSerializer,
)
from doctor.models import Prescription
from authentication.permissions import IsPharmacist


# ==============================
# MEDICINE VIEWSET
# ==============================
class MedicineViewSet(ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name"]

    def get_permissions(self):
        # ✅ FIX: Doctors need to read the medicines list when writing a prescription.
        # The old code used IsPharmacist for ALL actions, so doctors got a 403 on
        # GET /api/pharmacist/medicines/ causing "Failed to load medicines" in the UI.
        # Now: list & retrieve are open to any authenticated user (doctors, etc.),
        # while create / update / delete still require the Pharmacist role.
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsPharmacist()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Medicines fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,  # kept for frontend compatibility
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "Medicine added successfully",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "Medicine updated successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            instance.delete()

        except ProtectedError:
            return Response(
                {
                    "message": (
                        "Cannot delete this medicine because it "
                        "is used in existing prescriptions."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {"message": "Medicine deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


# ==============================
# MEDICINE BATCH VIEWSET
# ==============================
class MedicineBatchViewSet(ModelViewSet):
    queryset = MedicineBatch.objects.all().select_related("medicine")
    serializer_class = MedicineBatchSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["medicine"]
    search_fields = ["batch_number", "medicine__name"]
    permission_classes = [IsAuthenticated, IsPharmacist]

    def get_queryset(self):
        return super().get_queryset().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Batches fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "Medicine batch added successfully",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


# ==============================
# DISPENSE VIEWSET
# ==============================
class DispenseViewSet(ModelViewSet):
    queryset = Dispense.objects.all().select_related(
        "prescription__consultation__appointment__patient",
        "prescription__doctor",
    ).prefetch_related("items__batch__medicine")

    serializer_class = DispenseSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["prescription", "status", "patient"]

    def get_queryset(self):
        return super().get_queryset().order_by("-dispense_date")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Dispenses fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dispense = serializer.save()
        return Response(
            {
                "message": "Medicine dispensed successfully",
                "data": DispenseSerializer(dispense).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ==============================
# DISPENSE ITEM VIEWSET
# ==============================
class DispenseItemViewSet(ReadOnlyModelViewSet):
    queryset = DispenseItem.objects.all().select_related(
        "dispense__prescription",
        "batch__medicine",
    )
    serializer_class = DispenseItemSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["dispense"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Dispense items fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==============================
# STOCK LOG VIEWSET
# ==============================
class MedicineStockLogViewSet(ReadOnlyModelViewSet):
    queryset = MedicineStockLog.objects.all().select_related("batch__medicine")
    serializer_class = MedicineStockLogSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["batch", "change_type"]

    def get_queryset(self):
        return super().get_queryset().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Stock logs fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==============================
# MEDICINE BILL VIEWSET
# ==============================
class MedicineBillViewSet(ModelViewSet):
    queryset = MedicineBill.objects.all().select_related(
        "dispense__prescription__consultation__appointment__patient"
    )
    serializer_class = MedicineBillSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["payment_status", "dispense"]

    def get_queryset(self):
        return super().get_queryset().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Bills fetched successfully",
                "count": queryset.count(),
                "data": serializer.data,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bill = serializer.save()
        return Response(
            {
                "message": "Medicine bill created successfully",
                "data": MedicineBillSerializer(bill).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ==============================
# SENT PRESCRIPTIONS LIST
# ==============================
class SentPrescriptionListView(APIView):
    permission_classes = [IsAuthenticated, IsPharmacist]

    def get(self, request):
        prescriptions = Prescription.objects.filter(
            status="Sent"
        ).select_related(
            "consultation__appointment__patient",
            "doctor",
        ).prefetch_related(
            "items__medicine_name"
        ).order_by("-sent_at")

        serializer = IncomingPrescriptionSerializer(prescriptions, many=True)

        return Response(
            {
                "message": "Sent prescriptions fetched successfully",
                "count": prescriptions.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ==============================
# SENT PRESCRIPTION DETAIL
# ==============================
class SentPrescriptionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPharmacist]

    def get(self, request, prescription_code):
        try:
            prescription = Prescription.objects.select_related(
                "consultation__appointment__patient",
                "doctor",
            ).prefetch_related(
                "items__medicine_name"
            ).get(
                prescription_code=prescription_code,
                status="Sent",
            )

        except Prescription.DoesNotExist:
            return Response(
                {"message": "Prescription not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = IncomingPrescriptionSerializer(prescription)

        return Response(
            {
                "message": "Prescription details fetched successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )