from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework.exceptions import ValidationError

from administration.serializers import StaffProfileSerializer


def convert_validation_error(exc):
    if hasattr(exc, "message_dict"):
        return exc.message_dict

    return {"detail": exc.messages}


@transaction.atomic
def update_role_profile(
    *,
    profile,
    serializer_class,
    data,
):
    if not isinstance(data, dict):
        raise ValidationError({
            "detail": "Expected a JSON object."
        })

    staff_data = data.get("staff")

    profile_data = {
        key: value
        for key, value in data.items()
        if key != "staff"
    }

    if staff_data is not None:
        if not isinstance(staff_data, dict):
            raise ValidationError({
                "staff": "Expected a staff object."
            })

        if profile.staff_id is None:
            raise ValidationError({
                "staff": "This profile has no linked staff account."
            })

        if (
            "role" in staff_data
            and staff_data["role"] != profile.staff.role
        ):
            raise ValidationError({
                "role": "Changing the staff role is not supported here."
            })

    profile_serializer = serializer_class(
        profile,
        data=profile_data,
        partial=True,
    )

    profile_serializer.is_valid(raise_exception=True)

    staff_serializer = None

    if staff_data is not None:
        staff_serializer = StaffProfileSerializer(
            profile.staff,
            data=staff_data,
            partial=True,
        )

        staff_serializer.is_valid(raise_exception=True)

    try:
        if staff_serializer is not None:
            staff_serializer.save()

        profile_serializer.save()

    except DjangoValidationError as exc:
        raise ValidationError(
            convert_validation_error(exc)
        ) from exc

    profile.refresh_from_db()

    return profile