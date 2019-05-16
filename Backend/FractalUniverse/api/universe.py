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
from django.core.paginator import Paginator, EmptyPage

class PostSerializer(serializers.Serializer):
    name = serializers.CharField(required=True)
    function = serializers.CharField(required=True)

class PutSerializer(serializers.Serializer):
    function = serializers.CharField(required=True)


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
        universes = Universe.objects.all().order_by("-id")
    else:
        universes = Universe.objects.filter(name__icontains = keywords).order_by("-id");
    paginator = Paginator(universes, 5)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status = HTTP_404_NOT_FOUND)
    response = []
    for universe in page.object_list:
        response.append({
            "id": universe.id,
            "name": universe.name,
            "function": universe.function
        })
    return Response({
        "maxPages": paginator.num_pages,
        "universes": response
    }, status = HTTP_200_OK)


# TODO: add admin permissions
@csrf_exempt
@api_view(["POST", "PUT", "DELETE"])
@permission_classes((IsAuthenticated,))
def universes(request, universe = None):
    if request.method == "POST":
        if not universe is None:
            raise MethodNotAllowed("POST")
        serializer = PostSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        function = serializer.data["function"]
        name = serializer.data["name"]
        initial = "x+y*1j"
        if Universe.objects.filter(function = function, name = name, initial_value = initial).exists():
            return Response({
                "function": _("Universe arleady exists.")
            }, status = HTTP_400_BAD_REQUEST)
        universe = Universe.objects.create(function = function, name= name, initial_value = initial)
        universe.save()
        return Response({
            "success": True,
            "universe": {
                "id": universe.id,
                "name": universe.name,
                "function": universe.function
            }
        }, status = HTTP_200_OK)
    elif request.method == "PUT":
        serializer = PutSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        try:
            universe = Universe.objects.get(id = universe)
        except Universe.DoesNotExists:
            return Response({
                "detail": _("Universe not found.")
            }, status = HTTP_404_NOT_FOUND)
        universe.function = serializer.data["function"]
        universe.save()
        return Response({
            "success": True
        }, status = HTTP_200_OK)
    elif request.method == "DELETE":
        try:
            universe = Universe.objects.get(id = universe)
        except Universe.DoesNotExists:
            return Response({
                "detail": _("Universe not found.")
            }, status = HTTP_404_NOT_FOUND)
        universe.delete()
        return Response({
            "success": True
        }, status = HTTP_200_OK)
