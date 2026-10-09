from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from rest_framework.exceptions import ValidationError

from administration.models import (
    DoctorProfile,
    ReceptionistProfile,
    LabTechnicianProfile,
    PharmacistProfile,
)

from administration.serializers import StaffProfileSerializer


ROLE_CONFIG = {
    "Doctor": {
        "model": DoctorProfile,
        "fields": {
            "specialization",
            "consultation_fee",
            "experience_years",
        },
    },
    "Receptionist": {
        "model": ReceptionistProfile,
        "fields": set(),
    },
    "Lab Technician": {
        "model": LabTechnicianProfile,
        "fields": {
            "certification_details",
        },
    },
    "Pharmacist": {
        "model": PharmacistProfile,
        "fields": {
            "license_number",
        },
    },
}


def convert_model_error(exc):
    if hasattr(exc, "message_dict"):
        return exc.message_dict

    return {"detail": exc.messages}


@transaction.atomic
def create_role_profile(*, role, staff_data, profile_data=None):
    """
    Atomically create a User, StaffProfile and role-specific profile.

    StaffProfile's existing post_save signal creates the
    role-specific profile. This service then updates its details.
    """

    config = ROLE_CONFIG.get(role)

    if config is None:
        raise ValidationError({
            "role": "Unsupported role."
        })

    if not isinstance(staff_data, dict):
        raise ValidationError({
            "staff": "Expected an object containing staff details."
        })

    if profile_data is None:
        profile_data = {}

    if not isinstance(profile_data, dict):
        raise ValidationError({
            "profile": "Expected an object."
        })

    submitted_role = staff_data.get("role", role)

    if submitted_role != role:
        raise ValidationError({
            "staff": {
                "role": "Role does not match this endpoint."
            }
        })

    unexpected_fields = (
        set(profile_data) - config["fields"]
    )

    if unexpected_fields:
        raise ValidationError({
            "profile": {
                field: ["This field is not supported."]
                for field in sorted(unexpected_fields)
            }
        })

    staff_serializer = StaffProfileSerializer(
        data={
            **staff_data,
            "role": role,
        }
    )

    staff_serializer.is_valid(raise_exception=True)

    try:
        staff = staff_serializer.save()

        profile = config["model"].objects.get(
            staff=staff
        )

        for field, value in profile_data.items():
            setattr(profile, field, value)

        profile.full_clean()
        profile.save()

    except DjangoValidationError as exc:
        raise ValidationError(
            convert_model_error(exc)
        ) from exc

    except config["model"].DoesNotExist as exc:
        raise ValidationError({
            "staff": (
                "The staff signal did not create "
                "the required role profile."
            )
        }) from exc

    return profile