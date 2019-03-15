from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.response import Response
from ..serializers import UserSigninSerializer
from ..models import User, Token

@csrf_exempt
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def test(request):
    return Response({
        "okay": True
    }, status = HTTP_200_OK)

@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def login(request):
    serializer = UserSigninSerializer(data = request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    if not User.objects.filter(login = serializer.data["login"]).exists():
        return Response({
            "login": "User not found."
        }, status = HTTP_404_NOT_FOUND)
    user = authenticate(username = serializer.data["login"], password = serializer.data["password"])
    if not user:
        return Response({
            "password": "Wrong password."
        }, status = HTTP_404_NOT_FOUND)
    remember = serializer.data["remember"]
    token = Token.objects.create(user = user, remember = remember)
    print("[/api/auth/login] User " + str(user.login) + " logged in as token " + str(token.key));
    return Response({
        "token": token.key
    }, status = HTTP_200_OK)
