from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST
)
from django.utils.translation import gettext as _
from rest_framework import serializers
from ..models import Palette, Fractal, Dimension
from ..utils import info, search_view, task_manager
from django.core.exceptions import ObjectDoesNotExist
from ..utils.api_view import APIViewWithPermissions, with_permissions
from ..utils.permissions import IsPremium


class PostSerializer(serializers.Serializer):
    x = serializers.FloatField(required=True)
    y = serializers.FloatField(required=True)


@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def search(request, dimension):
    try:
        dimension = Dimension.objects.get(id=dimension)
    except ObjectDoesNotExist:
        return Response({
            "detail": _("Dimension not found.")
        }, status=HTTP_404_NOT_FOUND)

    def searchf(objects, keywords):
        if not keywords:
            return objects.filter(dimension=dimension).exclude(id=dimension.map.id)
        else:
            return objects.filter(dimension=dimension, name__icontains=keywords).exclude(id=dimension.map.id)

    return search_view.search(Fractal, request, searchf, info.fractal)


class View(APIViewWithPermissions):

    @with_permissions((IsPremium,))
    def post(self, request, dimension=None):
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            dimension = Dimension.objects.get(id=dimension)
        except ObjectDoesNotExist:
            return Response({
                "detail": _("Dimension not found.")
            }, status=HTTP_404_NOT_FOUND)
        x = serializer.data["x"]
        y = serializer.data["y"]
        if Fractal.objects.filter(dimension=dimension, x=x, y=y).exists():
            return Response({
                "detail": _("Fractal arleady exists.")
            }, status=HTTP_400_BAD_REQUEST)
        fractal = Fractal.objects.create(
            dimension=dimension,
            x=x,
            y=y,
            user=request.user
        )
        task_manager.calculate(fractal, request.user)
        return Response(info.fractal(fractal), status=HTTP_200_OK)


# # add premium permission class
# @csrf_exempt
# @api_view(["GET", "POST"])
# @permission_classes((IsAuthenticated,))
# def fractals(request, id = None):
#     if request.method == "GET":
#         try:
#             fractal = Fractal.objects.get(id = id)
#         except Fractal.DoesNotExist:
#             return Response({
#                 "id": _("Fractal not found.")
#             }, status = HTTP_404_NOT_FOUND)
#         info = fractal_info(fractal)
#         # if not fractal.calculated:
#         tinfo = task_manager.info(fractal)
#         if not tinfo is None:
#             info["progress"] = tinfo["progress"]
#         return Response(info, status = HTTP_200_OK)
#     else:
#         serializer = FractalPost(data = request.data)
#         serializer.is_valid(raise_exception=True)
#         palette = Palette.objects.get(id = serializer.data["palette"], user = request.user)
#         if palette is None:
#             return Response({
#                 "palette": _("Palette not found.")
#             }, status = HTTP_404_NOT_FOUND)
#         dimension = Dimension.objects.get(id = serializer.data["dimension"])
#         if dimension is None:
#             return Response({
#                 "dimension": _("Dimension not found.")
#             }, status = HTTP_404_NOT_FOUND)
#         fractal = Fractal.objects.create(
#             palette = palette,
#             width = serializer.data["width"],
#             height = serializer.data["height"],
#             dimension = dimension
#         )
#         task_manager.calculate(fractal)
#         fractal.save()
#         return Response(fractal_info(fractal), status = HTTP_200_OK)
#
# @csrf_exempt
# @api_view(["GET"])
# @permission_classes((IsAuthenticated,))
# def latest_fractals(request):
#     # TEST
#     palette = Palette.objects.first()
#     colors = f.gradation_from_palette(palette)
#     steps = f.calculateM("v**n+z", "x+1j*y", "2", 100, 100, len(colors), {})
#     f.image_from_map(steps, 100, 100, colors).show()
#     # TEST
#     # fractals = Fractal.objects.filter(state = Fractal.STATE_READY).order_by("-id")[:10]
#     response = []
#     # for fractal in fractals:
#     #     response.append(fractal_info(fractal))
#     return Response(response, status = HTTP_200_OK)
