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
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers
from ..models import Palette

class PostSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    gradations = serializers.IntegerField(required=True, min_value=0, max_value=40)
    colors = serializers.ListField(
        required=True,
        child = serializers.IntegerField(min_value=0, max_value=16777215)
    )

@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def palettes(request):
    serializer = PostSerializer(data = request.data)
    serializer.is_valid(raise_exception=True)
    if Palette.objects.filter(colors = serializer.data["colors"], gradations = serializer.data["gradations"]).exists():
        return Response({
            "detail": _("Palette arleady exists.")
        }, status = HTTP_400_BAD_REQUEST)
    palette = Palette.objects.create(user = request.user, name = serializer.data["name"], colors = serializer.data["colors"], gradations= serializer.data["gradations"])
    palette.save()
    return Response({
        "id": palette.id
    }, status = HTTP_200_OK)
