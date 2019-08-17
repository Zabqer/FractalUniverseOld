from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from ..utils.api_view import APIViewWithPermissions, with_permissions, CaptchaValidator, APIViewSearch
from ..models import User, AuthToken
from rest_framework import serializers
from django.utils.translation import gettext as _
from django.contrib.auth import authenticate
from ..utils import info
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import PermissionDenied


class SearchView(APIViewSearch):

    scope = "session-search"

    model = AuthToken
    serializer = (info.session,True)

    name = "sessions"

    order = "created"

    @with_permissions((IsAdminUser,))
    def search(self, objects, keywords):
        if not keywords:
            return objects.filter()
        else:
            return objects.filter(created=keywords)


class UserSearchView(APIViewSearch):

    scope = "user-session-search"

    model = AuthToken
    serializer = (info.session,)

    name = "sessions"

    order = "created"

    @with_permissions((IsAuthenticated,))
    def search(self, objects, keywords):
        if not keywords:
            return objects.filter(user=self.request.user)
        else:
            return objects.filter(user=self.request.user, created=keywords)


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
        token.generate_key()
        token.save()
        return Response({
            "token": token.key,
            "expire_at": token.expire_at,
            "user": info.user(user, True)
        }, status=HTTP_200_OK)

    @with_permissions((IsAuthenticated,))
    def delete(self, request, user=None, session=None):
        if not session:
            request.auth.key = None
            request.auth.expire_at = None
            request.auth.save()
            return Response(None, status=HTTP_204_NO_CONTENT)
        else:
            if user:
                if not request.user.is_staff:
                    raise PermissionDenied()
                try:
                    user = User.objects.get(id=user)
                except ObjectDoesNotExist:
                    return Response({
                        "detail": _("User not found.")
                    }, status=HTTP_404_NOT_FOUND)
                try:
                    token = user.auth_tokens.get(id=session)
                except ObjectDoesNotExist:
                    return Response({
                        "detail": _("Session not found.")
                    }, status=HTTP_404_NOT_FOUND)
                if not token.expire_at:
                    return Response({
                        "detail": _("Arleady deleted.")
                    }, status=HTTP_404_NOT_FOUND)
                token.key = None
                token.expire_at = None
                token.save()
                return Response(None, status=HTTP_204_NO_CONTENT)
            else:
                try:
                    token = request.user.auth_tokens.get(id=session)
                except ObjectDoesNotExist:
                    return Response({
                        "detail": _("Session not found.")
                    }, status=HTTP_404_NOT_FOUND)
                if not token.expire_at:
                    return Response({
                        "detail": _("Arleady deleted.")
                    }, status=HTTP_404_NOT_FOUND)
                token.key = None
                token.expire_at = None
                token.save()
                return Response(None, status=HTTP_204_NO_CONTENT)
