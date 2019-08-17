from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
    HTTP_200_OK
)
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers
from ..models import Palette
from ..utils import info
from django.core.exceptions import ObjectDoesNotExist
from ..utils.api_view import APIViewWithPermissions, with_permissions, CaptchaValidator, APIViewSearch
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied
from ..utils.permissions import IsPremium


class PostSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    gradations = serializers.IntegerField(required=True, min_value=0, max_value=40)
    colors = serializers.ListField(
        required=True,
        child=serializers.IntegerField(min_value=0, max_value=16777215)
    )
    glob = serializers.BooleanField(default=False)


class SearchView(APIViewSearch):

    scope = "palette-search"

    model = Palette
    serializer = (info.palette,)

    @with_permissions((AllowAny,))
    def search(self, objects, keywords):
        return super().search(objects, keywords)


class UserSearchView(APIViewSearch):

    scope = "user-palette-search"

    model = Palette
    serializer = (info.palette,)

    @with_permissions((IsAuthenticated,))
    def search(self, objects, keywords):
        if not keywords:
            return objects.filter(user=self.request.user)
        else:
            return objects.filter(user=self.request.user, name__icontains=keywords)


class DefaultView(APIViewWithPermissions):

    scope = "palette-default"

    @with_permissions((AllowAny,))
    def get(self, request, palette=None):
        palette = Palette.objects.first()
        if not palette:
            return Response({
                "detail": _("Palette not found.")
            }, status=HTTP_404_NOT_FOUND)
        return Response(info.palette(palette), status=HTTP_200_OK);


class View(APIViewWithPermissions):

    scope = "palette"

    @with_permissions((AllowAny,))
    def get(self, request, palette=None):
        if not palette:
            raise MethodNotAllowed("GET")
        try:
            palette = Palette.objects.get(id=palette)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Palette not found.")
            }, status=HTTP_404_NOT_FOUND)
        return Response(info.palette(palette), status=HTTP_200_OK)

    @with_permissions((IsPremium,))
    def post(self, request, palette=None):
        if palette:
            raise MethodNotAllowed("POST")
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        colors = serializer.data["colors"]
        gradations = serializer.data["gradations"]
        name = serializer.data["name"]
        glob = serializer.data["glob"]
        if glob and not request.user.is_staff:
            raise PermissionDenied()
        if Palette.objects.filter(
            colors=colors,
            gradations=gradations
        ).exists():
            return Response({
                "detail": _("Palette arleady exists.")
            }, status=HTTP_400_BAD_REQUEST)
        palette = Palette.objects.create(
            user=None if glob else request.user,
            name=name,
            colors=colors,
            gradations=gradations
        )
        palette.save()
        return Response(info.palette(palette), status=HTTP_200_OK)

    @with_permissions((IsAuthenticated,))
    def delete(self, request, palette=None):
        if not palette:
            raise MethodNotAllowed("DELETE")
        try:
            palette = Palette.objects.get(id=palette)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Palette not found.")
            }, status=HTTP_404_NOT_FOUND)
        if not (request.user.is_staff or (palette.user and palette.user.id != request.user.id)):
            raise PermissionDenied()
        palette.delete()
        return Response(None, status=HTTP_204_NO_CONTENT)
