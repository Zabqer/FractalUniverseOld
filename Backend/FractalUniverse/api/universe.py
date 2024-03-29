from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
    HTTP_200_OK
)
from ..models import Universe
from django.utils.translation import gettext as _
from rest_framework import serializers
from rest_framework.exceptions import MethodNotAllowed
from ..utils import info
from ..utils.api_view import APIViewWithPermissions, with_permissions, APIViewSearch
from rest_framework.permissions import AllowAny, IsAdminUser
from django.core.exceptions import ObjectDoesNotExist


class EditSerializer(serializers.Serializer):
    active = serializers.BooleanField(required=False)


class PostSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    function = serializers.CharField(required=True)


class SearchView(APIViewSearch):

    scope = "universe-search"

    model = Universe
    serializer = (info.universe,)

    @with_permissions((IsAuthenticated,))
    def search(self, objects, keywords):
        return super().search(objects, keywords)


class View(APIViewWithPermissions):

    scope = "universe"

    @with_permissions((AllowAny,))
    def get(self, request, universe=None):
        if not universe:
            raise MethodNotAllowed("GET")
        try:
            universe = Universe.objects.get(id=universe)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Universe not found.")
            }, status=HTTP_404_NOT_FOUND)
        return Response(info.universe(universe), status=HTTP_200_OK)

    @with_permissions((IsAdminUser,))
    def post(self, request, universe=None):
        if universe:
            raise MethodNotAllowed("POST")
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        function = serializer.data["function"]
        name = serializer.data["name"]
        initial = "x+y*1j"
        if Universe.objects.filter(function=function, name=name, initial_value=initial).exists():
            return Response({
                "detail": _("Universe arleady exists.")
            }, status=HTTP_400_BAD_REQUEST)
        universe = Universe.objects.create(function=function, name=name, initial_value=initial)
        universe.save()
        return Response(info.universe(universe), status=HTTP_200_OK)

    @with_permissions((IsAdminUser,))
    def put(self, request, universe):
        try:
            universe = Universe.objects.get(id=universe)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Universe not found.")
            }, status=HTTP_404_NOT_FOUND)
        serializer = EditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        if "active" in data:
            universe.is_active = data["active"]
        universe.save()
        return Response(info.universe(universe), status=HTTP_200_OK)

    @with_permissions((IsAdminUser,))
    def delete(self, request, universe=None):
        try:
            universe = Universe.objects.get(id=universe)
        except Universe.DoesNotExists:
            return Response({
                "detail": _("Universe not found.")
            }, status=HTTP_404_NOT_FOUND)
        universe.delete()
        return Response(None, status=HTTP_204_NO_CONTENT)
