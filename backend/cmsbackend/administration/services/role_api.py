from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from administration.services.role_creation import (
    create_role_profile,
)


class RoleCreationMixin:
    """
    Shared POST behavior for administration role endpoints.

    The concrete view must define:
        role_name
        serializer_class
    """

    role_name = None

    def post(self, request, *args, **kwargs):
        if self.role_name is None:
            raise ValidationError({
                "role": "Role configuration is missing."
            })

        payload = request.data

        staff_data = payload.get("staff")

        if not isinstance(staff_data, dict):
            raise ValidationError({
                "staff": "Staff details are required."
            })

        # The frontend submits role-specific fields
        # alongside the nested staff object.
        profile_data = {
            key: value
            for key, value in payload.items()
            if key != "staff"
        }

        profile = create_role_profile(
            role=self.role_name,
            staff_data=staff_data,
            profile_data=profile_data,
        )

        serializer = self.serializer_class(profile)

        return Response(
            {
                "message": (
                    f"{self.role_name} created successfully."
                ),
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )