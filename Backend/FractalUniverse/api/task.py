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
from ..utils import info
from ..utils.api_view import APIViewWithPermissions, with_permissions, CaptchaValidator, APIViewSearch


class SearchView(APIViewSearch):

    scope = "task-search"

    model = FractalCalculateTask
    serializer = (info.task,)

    name = "tasks"

    @with_permissions((IsAuthenticated,))
    def search(self, objects, keywords):
        return super().search(objects, keywords)


class UserSearchView(APIViewSearch):

    scope = "user-task-search"

    model = FractalCalculateTask
    serializer = (info.task,)

    name = "tasks"

    @with_permissions((IsAuthenticated,))
    def search(self, objects, keywords):
        if not keywords:
            return objects.filter(user=self.request.user)
        else:
            return objects.filter(user=self.request.user, name__icontains=keywords)
