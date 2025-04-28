from django.contrib.auth import get_user_model
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated

from main.utils import GenericView

from account.serializers import (
    CustomTokenObtainPairSerializer,
    UserBaseSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserBaseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.set_password(request.data["password"])
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (AllowAny,)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserBaseSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Perform any logout actions if needed
        return Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )


class UserView(GenericView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserBaseSerializer