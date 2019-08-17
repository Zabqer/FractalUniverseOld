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
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ObjectDoesNotExist


class EditSerializer(serializers.Serializer):
    blocked = serializers.BooleanField(required=False)


class DeleteSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)


class ActivateSerializer(serializers.Serializer, CaptchaValidator):
    hash = serializers.CharField(required=False)



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
    def put(self, request, user=None):
        if user and user != request.user.id:
            if not request.user.is_staff:
                raise PermissionDenied()
            try:
                user = User.objects.get(id=user)
            except ObjectDoesNotExist:
                return Response({
                    "detail": _("User not found.")
                }, status=HTTP_404_NOT_FOUND)
        else:
            user = request.user
        serializer = EditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        if "blocked" in data and request.user.id != user.id:
            user.is_blocked = data["blocked"]
        user.save()
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

    @with_permissions((AllowAny,))
    def post(self, request, user):
        try:
            user = User.objects.get(id=user)
        except User.DoesNotExist:
            return Response({
                "detail": _("User not found.")
            }, status=HTTP_404_NOT_FOUND)
        serializer = ActivateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        hash = "hash" in serializer.data and serializer.data["hash"]
        if not hash:
            if not request.user or not request.user.is_staff:
                raise PermissionDenied()
            email_token = EmailVerificationToken.objects.filter(user=user)
            if not email_token.exists():
                return Response({
                    "detail": _("User arleady activated.")
                }, status=HTTP_400_BAD_REQUEST)
            user.is_active = True
            user.save()
            email_token.delete()
            return Response(None, status=HTTP_204_NO_CONTENT)
        else:
            try:
                email_token = EmailVerificationToken.objects.filter(user=user, key=hash)
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
