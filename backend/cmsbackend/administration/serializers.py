import re

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone

from .models import (
    StaffProfile, DoctorProfile, ReceptionistProfile,
    LabTechnicianProfile, PharmacistProfile, AuditLog
)

# ─── CONFIG ───────────────────────────────────────────────
ROLE_MIN_AGE = {
    "Doctor": 25,
    "Receptionist": 21,
    "Lab Technician": 22,
    "Pharmacist": 23,
    "Admin": 21
}

# pattern, error message
ROLE_QUALIFICATION_RULES = {
    "Doctor": (
        r"\bMBBS\b",
        "Doctor must have MBBS as a compulsory qualification.",
    ),
    "Pharmacist": (
        r"\bB\.?\s?Pharm\b",
        "Pharmacist must have B.Pharm as a compulsory qualification.",
    ),
    "Lab Technician": (
        r"\b(MIT|BMLT|DMLT|BSc\s?MLT|B\.Sc\s?MLT|MLT)\b",
        "Lab Technician must have a minimum qualification of MIT "
        "(or equivalent: DMLT, BMLT, BSc MLT).",
    ),
    "Receptionist": (
        r"\b(BA|B\.A|BBA|B\.B\.A|BCom|B\.Com|BCOM|BCA|B\.C\.A|BSc|B\.Sc|BHM|B\.H\.M)\b",
        "Receptionist must have a minimum 3-year degree "
        "(BA, BBA, BCom, BCA, BSc, or equivalent).",
    ),
}


def validate_qualification_for_role(role, qualification):
    """
    Raise serializers.ValidationError if the qualification does not
    meet the minimum requirement for the given role.
    Does nothing for roles without a rule (e.g. Admin).
    """
    rule = ROLE_QUALIFICATION_RULES.get(role)
    if not rule:
        return
    pattern, message = rule
    if not re.search(pattern, qualification or "", re.IGNORECASE):
        raise serializers.ValidationError({"qualification": message})

def calculate_age(dob):
    if not dob:
        return 0
    today = timezone.now().date()
    return (today - dob).days // 365


# ─── USER SERIALIZER ──────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']
        read_only_fields = ['id']
        extra_kwargs = {'username': {'required': False}}

    def create(self, validated_data):
        pwd = validated_data.pop("password", None)

        if not validated_data.get('username'):
            base = validated_data.get('email', '').split('@')[0] or 'user'
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1
            validated_data['username'] = username

        user = User(**validated_data)

        if pwd:
            user.set_password(pwd)
        else:
            user.set_unusable_password()

        user.save()
        return user

    def update(self, instance, validated_data):
        pwd = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if pwd:
            instance.set_password(pwd)

        instance.save()
        return instance


# ─── STAFF PROFILE SERIALIZER ─────────────────────────────
class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = StaffProfile
        fields = "__all__"
        read_only_fields = ['staff_code', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")

        # Password is mandatory when creating new staff — without it they cannot log in.
        if not user_data.get("password"):
            raise serializers.ValidationError({
                "user": {"password": "A password is required when creating a new staff member."}
            })

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        dob = validated_data.get("date_of_birth")
        role = validated_data.get("role")

        if dob and calculate_age(dob) < ROLE_MIN_AGE.get(role, 21):
            raise serializers.ValidationError({
                "date_of_birth": f"{role} must be at least {ROLE_MIN_AGE.get(role, 21)} years old."
            })

        validate_qualification_for_role(role, validated_data.get("qualification", ""))

        return StaffProfile.objects.create(user=user, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)

        # Special case:
        # If admin is only activating/deactivating the staff member,
        # update only the active status.
        #
        # This prevents unrelated legacy DOB/qualification values
        # from blocking an account-status change.
        if (
            set(validated_data.keys()) == {"is_active"}
            and user_data is None
        ):
            new_status = validated_data["is_active"]

            StaffProfile.objects.filter(
                pk=instance.pk
            ).update(
                is_active=new_status
            )

            User.objects.filter(
                pk=instance.user_id
            ).update(
                is_active=new_status
            )

            instance.is_active = new_status

            return instance

        # Update nested Django User fields when supplied.
        if user_data:
            UserSerializer().update(
                instance.user,
                user_data
            )

        # Validate age when DOB or role is actually being changed.
        if (
            "date_of_birth" in validated_data
            or "role" in validated_data
        ):
            dob = validated_data.get(
                "date_of_birth",
                instance.date_of_birth
            )

            role = validated_data.get(
                "role",
                instance.role
            )

            if (
                dob
                and calculate_age(dob)
                < ROLE_MIN_AGE.get(role, 21)
            ):
                raise serializers.ValidationError({
                    "date_of_birth":
                        f"{role} must be at least "
                        f"{ROLE_MIN_AGE.get(role, 21)} "
                        "years old."
                })

        # Validate qualification when qualification
        # or role is actually being changed.
        if (
            "qualification" in validated_data
            or "role" in validated_data
        ):
            role = validated_data.get(
                "role",
                instance.role
            )

            qualification = validated_data.get(
                "qualification",
                instance.qualification
            )

            validate_qualification_for_role(
                role,
                qualification
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance


# ─── ROLE SERIALIZERS ─────────────────────────────────────
class DoctorProfileSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = "__all__"


class ReceptionistProfileSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)

    class Meta:
        model = ReceptionistProfile
        fields = "__all__"


class LabTechnicianProfileSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)

    class Meta:
        model = LabTechnicianProfile
        fields = "__all__"


class PharmacistProfileSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)

    class Meta:
        model = PharmacistProfile
        fields = "__all__"


# ─── AUDIT LOG SERIALIZER ────────────────────────────────
class AuditLogSerializer(serializers.ModelSerializer):
    # FIX 2: Expose username as a plain string field called 'user'.
    # The old code had a separate `user_name` field, but the `user` field
    # still serialized as the raw FK integer — so AuditLogs.jsx showed
    # integers (e.g. "1") instead of the username.
    # Overriding `user` as a SerializerMethodField returns the username
    # string directly under the key the frontend already reads.
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        if obj.user:
            return obj.user.username
        return "system"

    class Meta:
        model = AuditLog
        fields = "__all__"