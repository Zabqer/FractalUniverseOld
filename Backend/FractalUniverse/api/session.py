from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..utils.api_view import APIViewWithPermissions, with_permissions, CaptchaValidator
from ..models import User, AuthToken
from rest_framework import serializers
from django.utils.translation import gettext as _
from django.contrib.auth import authenticate
from ..utils import info


class LoginSerializer(serializers.Serializer, CaptchaValidator):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    remember = serializers.BooleanField(required=True)


class View(APIViewWithPermissions):

    scope = "session"

    @with_permissions((AllowAny,))
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        login = serializer.data["login"]
        if not User.objects.filter(login=login).exists():
            return Response({
                "login": _("User not found.")
            }, status=HTTP_404_NOT_FOUND)
        user = authenticate(username=login, password=serializer.data["password"])
        if not user:
            return Response({
                "password": _("Invalid password.")
            }, status=HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({
                "login": _("User not active.")
            }, status=HTTP_404_NOT_FOUND)
        remember = serializer.data["remember"]
        token = AuthToken.objects.create(user=user, remember=remember)
        token.save()
        return Response({
            "token": token.key,
            "expire_at": token.expire_at,
            "user": info.user(user, True)
        }, status=HTTP_200_OK)

    @with_permissions((IsAuthenticated,))
    def delete(self, request, universe=None, dimension=None):
        request.auth.delete()
        return Response(None, status=HTTP_204_NO_CONTENT)
