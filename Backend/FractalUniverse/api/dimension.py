from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK,
    HTTP_204_NO_CONTENT
)
from ..models import Dimension, Universe, Fractal
from django.utils.translation import gettext as _
from rest_framework import serializers
from ..utils import info, task_manager
from django.core.exceptions import ObjectDoesNotExist
from ..utils.api_view import APIViewWithPermissions, with_permissions, APIViewSearch
from rest_framework.exceptions import MethodNotAllowed


class PostSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    parameter = serializers.CharField(required=True)


class SearchView(APIViewSearch):

    scope = "dimension-search"

    model = Dimension
    serializer = (info.dimension,)

    def prepare(self, universe=None):
        if universe:
            try:
                return {
                    "universe": Universe.objects.get(id=universe)
                }
            except ObjectDoesNotExist:
                return Response({
                    "detail": _("Universe not found.")
                }, status=HTTP_404_NOT_FOUND)

    @with_permissions((AllowAny,))
    def search(self, objects, keywords, universe=None):
        if not keywords:
            if universe:
                return objects.filter(universe=universe)
            else:
                return objects.all()
        else:
            if universe:
                return objects.filter(universe=universe, name__icontains=keywords)
            else:
                return objects.filter(name__icontains=keywords)


class View(APIViewWithPermissions):

    scope = "dimension"

    @with_permissions((AllowAny,))
    def get(self, request, dimension=None, universe=None):
        if dimension:
            try:
                dimension = Dimension.objects.get(id=dimension)
            except ObjectDoesNotExist:
                return Response({
                    "detail": _("Dimension not found.")
                }, status=HTTP_404_NOT_FOUND)
            return Response(info.dimension(dimension), status=HTTP_200_OK)
        else:
            try:
                universe = Universe.objects.get(id=universe)
            except ObjectDoesNotExist:
                return Response({
                    "detail": _("Universe not found.")
                }, status=HTTP_404_NOT_FOUND)
            response = []
            for dimension in Dimension.objects.filter(universe=universe):
                response.append(info.dimension(dimension))
            return Response(response, status=HTTP_200_OK)

    @with_permissions((AllowAny,))
    def post(self, request, universe=None, dimension=None):
        if dimension:
            raise MethodNotAllowed("POST")
        try:
            universe = Universe.objects.get(id=universe)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Universe not found.")
            }, status=HTTP_404_NOT_FOUND)
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.data["name"]
        parameter = serializer.data["parameter"]
        if Dimension.objects.filter(parameter=parameter, universe=universe).exists():
            return Response({
                "detail": _("Dimension arleady exists.")
            }, status=HTTP_400_BAD_REQUEST)
        dimension = Dimension.objects.create(
            parameter=parameter,
            universe=universe,
            name=name
        )
        dimension.map = Fractal.objects.create(
            dimension=dimension,
            x=1,
            y=1,
            user=request.user
        )
        dimension.save()
        task_manager.calculate(dimension.map, request.user)
        return Response(info.dimension(dimension), status=HTTP_200_OK)

    @with_permissions((IsAdminUser,))
    def delete(self, request, universe=None, dimension=None):
        if universe:
            raise MethodNotAllowed("DELETE")
        try:
            dimension = Dimension.objects.get(id=dimension)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Dimension not found.")
            }, status=HTTP_404_NOT_FOUND)
        dimension.delete()
        return Response(None, status=HTTP_204_NO_CONTENT)
