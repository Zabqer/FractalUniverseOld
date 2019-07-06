from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from ..models import User, AuthToken, EmailVerificationToken
from django.utils.translation import gettext as _
from ..utils import info, email_sender
from rest_framework import serializers
from django.db.models import Q
from rest_framework.throttling import ScopedRateThrottle
from ..utils.api_view import APIViewWithPermissions, with_permissions, CaptchaValidator, APIViewSearch


class DeleteSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)


class ActivateSerializer(serializers.Serializer, CaptchaValidator):
    user = serializers.IntegerField(required=True)
    hash = serializers.CharField(required=True)


class SearchView(APIViewSearch):

    scope = "user-search"

    model = User
    serializer = (info.user, True)

    @with_permissions((IsAdminUser,))
    def search(self, objects, keywords):
        if not keywords:
            return objects.all()
        else:
            return objects.filter(Q(login__icontains=keywords) | Q(email__icontains=keywords))


class RegisterSerializer(serializers.Serializer, CaptchaValidator):
    login = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class View(APIViewWithPermissions):

    scope = "user"

    @with_permissions((IsAuthenticated,))
    def get(self, request):
        return Response(info.user(request.user, True), status=HTTP_200_OK)

    @with_permissions((AllowAny,))
    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        login = serializer.data["login"]
        password = serializer.data["password"]
        email = serializer.data["email"]
        if User.objects.filter(login=login).exists():
            return Response({
                "login": _("Login already used.")
            }, status=HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({
                "email": _("Email already used.")
            }, status=HTTP_400_BAD_REQUEST)
        user = User.objects.create(login=login, email=email, is_active=False)
        user.set_password(password)
        user.save()
        email_token = EmailVerificationToken.objects.create(user=user)
        email_token.save()
        email_sender.send_verification_email(user, email_token)
        return Response(None, status=HTTP_204_NO_CONTENT)

    @with_permissions((IsAuthenticated,))
    def delete(self, request):
        serializer = DeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.data["password"]):
            return Response({
                "password": _("Invalid password.")
            }, status=HTTP_400_BAD_REQUEST)
        request.user.delete()
        return Response(None, status=HTTP_204_NO_CONTENT)


class ActivateView(APIViewWithPermissions):

    scope = "user-activate"

    @permission_classes((AllowAny,))
    def post(self, request):
        serializer = ActivateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.data["user"]
        try:
            user = User.objects.get(id=user)
        except User.DoesNotExist:
            return Response({
                "user": _("User not found.")
            }, status=HTTP_404_NOT_FOUND)
        hash = serializer.data["hash"]
        try:
            email_token = EmailVerificationToken.objects.filter(user=user, key=hash)
            email_token.delete()
        except EmailVerificationToken.DoesNotExist:
            return Response({
                "hash": _("Invalid hash.")
            }, status=HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.save()
        email_token.delete()
        token = AuthToken.objects.create(user=user, remember=True)
        token.save()
        return Response({
            "token": token.key,
            "expire_at": token.expire_at,
            "user": info.user(user, True)
        }, status=HTTP_200_OK)
