from rest_framework import status
from rest_framework.response import Response

from administration.services.role_update import (
    update_role_profile,
)


class RoleUpdateMixin:

    def put(self, request, pk):
        return self._update_role(request, pk)

    def patch(self, request, pk):
        return self._update_role(request, pk)

    def _update_role(self, request, pk):

        profile = self._obj(pk)

        updated_profile = update_role_profile(
            profile=profile,
            serializer_class=self.serializer_class,
            data=request.data,
        )

        serializer = self.serializer_class(
            updated_profile
        )

        return Response(
            {
                "message": "Updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )