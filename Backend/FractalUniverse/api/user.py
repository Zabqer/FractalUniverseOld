from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_204_NO_CONTENT,
    HTTP_200_OK
)
from ..models import User, Palette
import ast
from django.utils.translation import gettext as _
from .. import utils
from rest_framework import serializers
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

class DeleteSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)

class SearchSerializer(serializers.Serializer):
    keywords = serializers.CharField(allow_blank=True)
    page = serializers.IntegerField(required=True, min_value = 1)

@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def search(request):
    serializer = SearchSerializer(data = request.data)
    serializer.is_valid(raise_exception=True)
    keywords = serializer.data["keywords"]
    if len(keywords) == 0:
        users = User.objects.all().order_by("-id")
    else:
        users = User.objects.filter(Q(login__icontains = keywords) | Q(email__icontains = keywords)).order_by("-id");
    paginator = Paginator(users, 5)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status = HTTP_404_NOT_FOUND)
    response = []
    for user in page.object_list:
        response.append(utils.user_info(user, True))
    return Response({
        "maxPages": paginator.num_pages,
        "users": response
    }, status = HTTP_200_OK)

@csrf_exempt
@api_view(["GET", "DELETE"])
@permission_classes((IsAuthenticated,))
def users(request, id = None):
    if request.method == "GET":
        return Response(utils.user_info(request.user, True), status = HTTP_200_OK)
    elif request.method == "DELETE":
        serializer = DeleteSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.data["password"]):
            return Response({
                "password": _("Invalid password.")
            }, status = HTTP_400_BAD_REQUEST)
        request.user.delete()
        return Response({
            "success": True
        }, status = HTTP_200_OK)

# @csrf_exempt
# @api_view(["GET"])
# @permission_classes((IsAuthenticated,))
# def info(request, id=None):
#     if id is None:
#         return Response(utils.user_info(request.user, True), status = HTTP_200_OK)
#     user = User.objects.get(id = id);
#     if not user:
#         return Response({
#             "detail": _("User not found.")
#         }, status = HTTP_404_NOT_FOUND)
#     if request.user.id == id:
#         return Response(utils.user_info(user, True), status = HTTP_200_OK)
#     else:
#         return Response(utils.user_info(user, True), status = HTTP_200_OK)
#
# @csrf_exempt
# @api_view(["GET", "POST", "PATCH", "DELETE"])
# @permission_classes((IsAuthenticated,))
# def palettes(request):
#     if request.method == "POST":
#         serializer = UserPostPlalette(data = request.data)
#         serializer.is_valid(raise_exception=True)
#         palette = Palette.objects.create(user = request.user, name = serializer.data["name"], colors = serializer.data["colors"], gradations= serializer.data["gradations"])
#         palette.save()
#         return Response({
#             "success": True,
#             "id": palette.id,
#             "name": palette.name,
#             "colors": palette.colors,
#             "gradations": palette.gradations
#         }, status = HTTP_200_OK)
#     elif request.method == "PATCH":
#         serializer = UserEditPlalette(data = request.data)
#         serializer.is_valid(raise_exception=True)
#         palette = Palette.objects.get(id = serializer.data["id"])
#         if palette is None:
#             return Response({
#                 "detail": _("Palette not found.")
#             }, status = HTTP_404_NOT_FOUND)
#         palette.name = serializer.data["name"]
#         palette.colors = serializer.data["colors"]
#         palette.gradations = serializer.data["gradations"]
#         palette.save()
#         return Response({
#             "success": True,
#             "id": palette.id,
#             "name": palette.name,
#             "colors": palette.colors,
#             "gradations": palette.gradations
#         }, status = HTTP_200_OK)
#     elif request.method == "DELETE":
#         serializer = UserDeletePlalette(data = request.data)
#         serializer.is_valid(raise_exception=True)
#         palette = Palette.objects.get(id = serializer.data["id"])
#         if palette is None:
#             return Response({
#                 "detail": _("Palette not found.")
#             }, status = HTTP_404_NOT_FOUND)
#         palette.delete()
#         return Response({
#             "success": True,
#         }, status = HTTP_200_OK)
#     else:
#         palettes = Palette.objects.filter(user = request.user)
#         palettes_resp = []
#         for palette in palettes:
#             palettes_resp.append({
#                 "id": palette.id,
#                 "name": palette.name,
#                 "colors": ast.literal_eval(palette.colors),
#                 "gradations": palette.gradations
#             })
#         return Response(palettes_resp, status = HTTP_200_OK)
