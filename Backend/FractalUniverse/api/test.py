from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from django.utils.translation import gettext as _
from rest_framework import serializers
from ..models import Palette, Fractal, Dimension, User
from ..utils import fractal_info
from ..fractal_utils import task_manager
from ..fractal_utils import fractal as f

@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def test(request):
    fractal = Fractal.objects.first()
    print(fractal)
    task_manager.calculate(fractal)
    return Response({})
