from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from ..models import DrawableCalculateTask, Drawable
from django.utils.translation import gettext as _
from rest_framework import serializers
from .. import utils
from django.core.paginator import Paginator, EmptyPage

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
        tasks = DrawableCalculateTask.objects.all().order_by("-id")
    else:
        tasks = DrawableCalculateTask.objects.get(id = keywords).order_by("-id");
    paginator = Paginator(tasks, 5)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status = HTTP_404_NOT_FOUND)
    response = []
    for task in page.object_list:
        response.append({
            "id": task.id,
            "drawable": utils.drawable_info(task.drawable)
        })
    return Response({
        "maxPages": paginator.num_pages,
        "tasks": response
    }, status = HTTP_200_OK)
