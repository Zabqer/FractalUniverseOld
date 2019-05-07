from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_204_NO_CONTENT
)
from rest_framework.response import Response
from ..models import User, Token
from django.utils.translation import gettext as _
from .. import utils
from rest_framework import serializers
import json
import urllib

def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[-1].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip

class CaptchaValidator():
    captcha = serializers.CharField(required=True)
    def validate_captcha(self, data):
        if settings.DEBUG:
            return
        req = urllib.request.Request("https://www.google.com/recaptcha/api/siteverify", urllib.parse.urlencode({
            "secret": settings.GRECAPTCHA_PRIVATE_KEY,
            "response": data,
            "remoteip": get_client_ip(self.context.get("request"))
        }).encode("utf-8"))
        response = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
        if not response["success"]:
            raise serializers.ValidationError(response["error-codes"])

class RegisterSerializer(serializers.Serializer, CaptchaValidator):
    login = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

class SigninSerializer(serializers.Serializer, CaptchaValidator):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    remember = serializers.BooleanField(required=True)

@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def register(request):
    serializer = RegisterSerializer(data = request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    login = serializer.data["login"]
    password = serializer.data["password"]
    email = serializer.data["email"]
    if User.objects.filter(login = login).exists():
        return Response({
            "login": _("Login already used.")
        }, status = HTTP_400_BAD_REQUEST)
    if User.objects.filter(email = serializer.data["email"]).exists():
        return Response({
            "email": _("Email already used.")
        }, status = HTTP_400_BAD_REQUEST)
    user = User.objects.create(login = login, email = email)
    user.set_password(password)
    user.save()
    token = Token.objects.create(user = user, remember = True)
    token.save()
    return Response({
        "token": token.key,
        "expire_at": token.expire_at,
        "user": utils.user_info(user, True)
    }, status = HTTP_200_OK)

@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def logout(request):
    request.auth.delete()
    return Response(None, status = HTTP_204_NO_CONTENT)

@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def login(request):
    serializer = SigninSerializer(data = request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    login = serializer.data["login"]
    if not User.objects.filter(login = login).exists():
        return Response({
            "login": _("User not found.")
        }, status = HTTP_404_NOT_FOUND)
    user = authenticate(username = login, password = serializer.data["password"])
    if not user:
        return Response({
            "password": _("Invalid password.")
        }, status = HTTP_400_BAD_REQUEST)
    remember = serializer.data["remember"]
    token = Token.objects.create(user = user, remember = remember)
    token.save()
    return Response({
        "token": token.key,
        "expire_at": token.expire_at,
        "user": utils.user_info(user, True)
    }, status = HTTP_200_OK)
