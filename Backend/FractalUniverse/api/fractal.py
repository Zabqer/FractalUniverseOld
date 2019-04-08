from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from django.utils.translation import gettext as _
from ..models import Palette, Fractal, Dimension
from ..serializers import FractalPost
from ..utils import fractal_info
from ..fractal_utils import task_manager

# add premium permission class
@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes((IsAuthenticated,))
def fractals(request, id = None):
    if request.method == "GET":
        try:
            fractal = Fractal.objects.get(id = id)
        except Fractal.DoesNotExist:
            return Response({
                "id": _("Fractal not found.")
            }, status = HTTP_404_NOT_FOUND)
        info = fractal_info(fractal)
        # if not fractal.calculated:
        tinfo = task_manager.info(fractal)
        if not tinfo is None:
            info["progress"] = tinfo["progress"]
        return Response(info, status = HTTP_200_OK)
    else:
        serializer = FractalPost(data = request.data)
        serializer.is_valid(raise_exception=True)
        palette = Palette.objects.get(id = serializer.data["palette"], user = request.user)
        if palette is None:
            return Response({
                "palette": _("Palette not found.")
            }, status = HTTP_404_NOT_FOUND)
        dimension = Dimension.objects.get(id = serializer.data["dimension"])
        if dimension is None:
            return Response({
                "dimension": _("Dimension not found.")
            }, status = HTTP_404_NOT_FOUND)
        fractal = Fractal.objects.create(
            palette = palette,
            width = serializer.data["width"],
            height = serializer.data["height"],
            dimension = dimension
        )
        task_manager.calculate(fractal)
        fractal.save()
        return Response(fractal_info(fractal), status = HTTP_200_OK)

@csrf_exempt
@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def latest_fractals(request):
    fractals = Fractal.objects.filter(state = Fractal.STATE_READY).order_by("-id")[:10]
    response = []
    for fractal in fractals:
        response.append(fractal_info(fractal))
    return Response(response, status = HTTP_200_OK)
