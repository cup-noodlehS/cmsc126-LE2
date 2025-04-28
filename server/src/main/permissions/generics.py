from rest_framework.permissions import BasePermission
import os
import dotenv

dotenv.load_dotenv()


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        if os.getenv("DISABLE_AUTH") == "True":
            return True
        return bool(request.user and request.user.is_authenticated)
