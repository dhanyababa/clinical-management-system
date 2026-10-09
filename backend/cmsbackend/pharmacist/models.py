
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.validators import MinValueValidator


# ------------------------------
# Medicine
# ------------------------------
class Medicine(models.Model):
    medicine_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    def clean(self):
        if self.price <= 0:
            raise ValidationError({'price': 'Must be greater than zero.'})

        if not self.name.strip():
            raise ValidationError({'name': 'Cannot be blank.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ------------------------------
# Medicine Batch
# ------------------------------
class MedicineBatch(models.Model):
    batch_id = models.AutoField(primary_key=True)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50, unique=True, blank=True)
    quantity = models.PositiveIntegerField()
    expiry_date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)

    def clean(self):
        # ✅ BUG #4 FIX: Only validate expiry_date when it is being set/changed.
        # When save() is called with update_fields=['quantity'] from DispenseItem,
        # full_clean() is NOT called at all (we skip it below), so this is safe.
        # But if clean() IS called (normal create/update), always validate expiry.
        if self.expiry_date and self.expiry_date < timezone.now().date():
            raise ValidationError({'expiry_date': 'Must be a future date.'})

        if self.quantity is not None and self.quantity < 1:
            raise ValidationError({'quantity': 'Minimum 1 required.'})

    def save(self, *args, **kwargs):
        # ✅ BUG #4 FIX: If called with update_fields (e.g. stock deduction from
        # DispenseItem), SKIP full_clean entirely. full_clean() would re-validate
        # expiry_date using today's date, which would fail for batches whose expiry
        # date is still valid but close to today, OR raise spurious errors when
        # only the quantity field is being updated.
        update_fields = kwargs.get('update_fields')
        if update_fields:
            # Direct DB write — no validation needed for partial updates
            super().save(*args, **kwargs)
            return

        # Auto-generate batch number on creation
        if not self.batch_number:
            last = MedicineBatch.objects.order_by('-batch_id').first()
            next_no = (int(last.batch_number[1:]) + 1) if last else 1

            # Ensure uniqueness by looping
            while True:
                candidate = f"B{str(next_no).zfill(3)}"
                if not MedicineBatch.objects.filter(batch_number=candidate).exists():
                    break
                next_no += 1

            self.batch_number = candidate

        is_new = self.pk is None

        self.full_clean()
        super().save(*args, **kwargs)

        # Create stock log only on first creation
        if is_new:
            MedicineStockLog.objects.create(
                batch=self,
                change_type='ADD',
                quantity_changed=self.quantity
            )

    def __str__(self):
        return f"{self.medicine.name} - {self.batch_number}"


# ------------------------------
# Stock Log
# ------------------------------
class MedicineStockLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    batch = models.ForeignKey(MedicineBatch, on_delete=models.CASCADE, related_name="logs")

    change_type = models.CharField(max_length=20, choices=[
        ('ADD', 'Added'),
        ('DISPENSE', 'Dispensed'),
        ('EXPIRED', 'Expired')
    ])

    quantity_changed = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)

    def clean(self):
        if self.quantity_changed == 0:
            raise ValidationError("Cannot be zero")

        if self.change_type == 'ADD' and self.quantity_changed < 0:
            raise ValidationError("ADD must be positive")

        if self.change_type in ['DISPENSE', 'EXPIRED'] and self.quantity_changed > 0:
            raise ValidationError("Must be negative for stock out")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ------------------------------
# Dispense
# ------------------------------
class Dispense(models.Model):
    dispense_id = models.AutoField(primary_key=True)

    prescription = models.ForeignKey("doctor.Prescription", on_delete=models.CASCADE)
    patient = models.ForeignKey("reception.Patient", on_delete=models.CASCADE)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    dispense_date = models.DateTimeField(default=timezone.now)

    status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending'),
        ('Completed', 'Completed')
    ], default='Pending')

    def clean(self):
        if self.total_amount <= 0:
            raise ValidationError("Must be > 0")

    def __str__(self):
        return f"Dispense {self.dispense_id}"


# ------------------------------
# Dispense Item
# ------------------------------
class DispenseItem(models.Model):
    dispense = models.ForeignKey(Dispense, on_delete=models.CASCADE, related_name='items')
    batch = models.ForeignKey(MedicineBatch, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1")

        if self.batch.expiry_date < timezone.now().date():
            raise ValidationError("Batch expired")

        # ✅ BUG #3 FIX: Check against the ACTUAL current DB quantity, not the
        # in-memory value that may have already been decremented by another item
        # in the same transaction.
        if self.pk is None:
            # New item — fetch fresh quantity from DB to avoid stale in-memory value
            current_qty = MedicineBatch.objects.filter(
                pk=self.batch.pk
            ).values_list('quantity', flat=True).first()

            if current_qty is None:
                raise ValidationError("Batch not found")

            if self.quantity > current_qty:
                raise ValidationError(
                    f"Not enough stock. Only {current_qty} unit(s) available in "
                    f"batch {self.batch.batch_number}."
                )

    def save(self, *args, **kwargs):
        # Auto-set price from medicine
        self.price = self.batch.medicine.price

        # Run validation (uses DB-fresh stock check above)
        self.full_clean()

        if not self.pk:
            # ✅ BUG #3 FIX: Use QuerySet.update() instead of instance.save() to
            # deduct stock. This bypasses MedicineBatch.save() entirely, which means
            # full_clean() on MedicineBatch is NOT called. This prevents the bug
            # where batch.save(update_fields=['quantity']) triggers full_clean(),
            # which re-validates expiry_date and raises errors on valid batches.
            MedicineBatch.objects.filter(pk=self.batch.pk).update(
                quantity=models.F('quantity') - self.quantity
            )

            # Refresh in-memory batch so subsequent reads are accurate
            self.batch.refresh_from_db(fields=['quantity'])

            # Write stock log
            MedicineStockLog.objects.create(
                batch=self.batch,
                change_type='DISPENSE',
                quantity_changed=-self.quantity
            )

        super().save(*args, **kwargs)


# ------------------------------
# Medicine Bill
# ------------------------------
class MedicineBill(models.Model):
    bill_id = models.AutoField(primary_key=True)

    dispense = models.OneToOneField(Dispense, on_delete=models.CASCADE)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    payment_status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending'),
        ('Paid', 'Paid')
    ], default='Pending')

    created_at = models.DateTimeField(default=timezone.now)

    def clean(self):
        if self.total_amount <= 0:
            raise ValidationError("Total must be > 0")

        if self.discount < 0:
            raise ValidationError("Discount cannot be negative")

        if self.discount > self.total_amount:
            raise ValidationError("Invalid discount")

        if self.dispense and self.total_amount != self.dispense.total_amount:
            raise ValidationError("Must match dispense total")

    def save(self, *args, **kwargs):
        self.full_clean()
        self.final_amount = self.total_amount - self.discount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bill {self.bill_id}"