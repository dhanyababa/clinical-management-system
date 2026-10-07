

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import MedicineBatch, MedicineStockLog





# ------------------------------
# Expiry Handler (Manual / Cron Job)
# ------------------------------
def check_expired_batches():
    today = timezone.now().date()

    expired_batches = MedicineBatch.objects.filter(
        expiry_date__lt=today,
        quantity__gt=0
    )

    for batch in expired_batches:
        MedicineStockLog.objects.create(
            batch=batch,
            change_type="EXPIRED",
            quantity_changed=-batch.quantity,
            remarks="Batch expired"
        )

        batch.quantity = 0
        batch.save(update_fields=['quantity'])