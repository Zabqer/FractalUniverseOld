from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from ..models import Dimension, Universe, Drawable, Palette, Fractal
from django.utils.translation import gettext as _
from rest_framework import serializers
from ..fractal_utils import task_manager
from .. import utils
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage

class PostSerializer(serializers.Serializer):
    parameter = serializers.FloatField(required=True)

class SearchSerializer(serializers.Serializer):
    keywords = serializers.CharField(allow_blank=True)
    page = serializers.IntegerField(required=True, min_value = 1)

@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def search(request, universe):
    try:
        universe = Universe.objects.get(id = universe)
    except ObjectDoesNotExist:
        return Response({
            "detail": _("Universe not found.")
        }, status = HTTP_404_NOT_FOUND)
    serializer = SearchSerializer(data = request.data)
    serializer.is_valid(raise_exception=True)
    keywords = serializer.data["keywords"]
    if len(keywords) == 0:
        dimensions = Dimension.objects.filter(universe = universe).order_by("-id")
    else:
        dimensions = Dimension.objects.filter(universe = universe, name__icontains = keywords).order_by("-id");
    paginator = Paginator(dimensions, 5)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status = HTTP_404_NOT_FOUND)
    response = []
    for dimension in page.object_list:
        response.append(utils.dimension_info(dimension))
    return Response({
        "maxPages": paginator.num_pages,
        "dimensions": response
    }, status = HTTP_200_OK)

# TODO: add admin permissions
@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes((IsAuthenticated,))
def dimensions(request, universe = None, dimension = None):
    if request.method == "GET":
        try:
            universe = Universe.objects.get(id = universe)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Universe not found.")
            }, status = HTTP_404_NOT_FOUND)
        response = []
        dimensions = Dimension.objects.filter(universe = universe)
        for dimension in dimensions:
            response.append(utils.dimension_info(dimension))
        return Response(response, status = HTTP_200_OK)
    elif request.method == "POST":
        try:
            universe = Universe.objects.get(id = universe)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Universe not found.")
            }, status = HTTP_404_NOT_FOUND)
        serializer = PostSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        parameter = serializer.data["parameter"]
        if Dimension.objects.filter(parameter = parameter, universe = universe).exists():
            return Response({
                "detail": _("Dimension arleady exists.")
            }, status = HTTP_400_BAD_REQUEST)
        dimension = Dimension.objects.create(
            parameter = parameter,
            universe = universe
        )
        map = Fractal.objects.create(
            dimension = dimension,
            x = 1,
            y = 1
        )
        dimension.map = map
        default_drawable = Drawable.objects.create(
            fractal = map,
            palette = Palette.objects.first()
        )
        map.default_drawable = default_drawable
        map.save()
        dimension.save()
        task_manager.calculate(dimension.map.default_drawable)
        return Response({
            "success": True,
            "dimension": utils.dimension_info(dimension)
        }, status = HTTP_200_OK)
    elif request.method == "PUT":
        serializer = PostSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        try:
            dimension = Dimension.objects.get(id = dimension)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Dimension not found.")
            }, status = HTTP_404_NOT_FOUND)
        dimension.parameter = serializer.data["parameter"]
        dimension.save()
        return Response({
            "success": True
        }, status = HTTP_200_OK)
    elif request.method == "DELETE":
        try:
            dimension = Dimension.objects.get(id = dimension)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Dimension not found.")
            }, status = HTTP_404_NOT_FOUND)
        dimension.delete()
        return Response({
            "success": True
        }, status = HTTP_200_OK)
