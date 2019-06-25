from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK
)
from ..models import FractalCalculateTask
from django.utils.translation import gettext as _
from ..utils import info, search_view


@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def search(request):
    return search_view.search(FractalCalculateTask, request, search_view.default_searchf, info.task, name="tasks")


@csrf_exempt
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def user_search(request):
    def searchf(objects, keywords):
        if not keywords:
            return objects.filter(user=request.user)
        else:
            return objects.filter(user=request.user, name__icontains=keywords)
    return search_view.search(FractalCalculateTask, request, searchf, info.task, name="tasks")
