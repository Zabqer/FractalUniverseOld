from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from ..models import User, Palette
import ast
from ..serializers import UserPostPlalette, UserDeletePlalette
from django.utils.translation import gettext as _
from .. import utils

@csrf_exempt
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def info(request, id=None):
    if id is None:
        return Response(utils.userInfo(request.user, True), status = HTTP_200_OK)
    user = User.objects.get(id = id);
    if not user:
        return Response({
            "detail": _("User not found.")
        }, status = HTTP_404_NOT_FOUND)
    if request.user.id == id:
        return Response(utils.userInfo(user, True), status = HTTP_200_OK)
    else:
        return Response(utils.userInfo(user, True), status = HTTP_200_OK)

@csrf_exempt
@api_view(["GET", "POST", "DELETE"])
@permission_classes((IsAuthenticated,))
def palettes(request):
    if request.method == "POST":
        serializer = UserPostPlalette(data = request.data)
        serializer.is_valid(raise_exception=True)
        palette = Palette.objects.create(user = request.user, name = serializer.data["name"], colors = serializer.data["colors"], gradations= serializer.data["gradations"])
        palette.save()
        return Response({
            "success": True,
            "id": palette.id,
            "name": palette.name,
            "colors": palette.colors,
            "gradations": palette.gradations
        }, status = HTTP_200_OK)
    elif request.method == "DELETE":
        serializer = UserDeletePlalette(data = request.data)
        serializer.is_valid(raise_exception=True)
        palette = Palette.objects.get(id = serializer.data["id"])
        if palette is None:
            return Response({
                "detail": _("Palette not found.")
            }, status = HTTP_404_NOT_FOUND)
        palette.delete()
        return Response({
            "success": True,
        }, status = HTTP_200_OK)
    else:
        palettes = Palette.objects.filter(user = request.user)
        palettes_resp = []
        for palette in palettes:
            palettes_resp.append({
                "id": palette.id,
                "name": palette.name,
                "colors": ast.literal_eval(palette.colors),
                "gradations": palette.gradations
            })
        return Response(palettes_resp, status = HTTP_200_OK)
