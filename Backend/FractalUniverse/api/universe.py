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

class PostSerializer(serializers.Serializer):
    function = serializers.CharField(required=True)
    # initial = serializers.CharField(required=True)

class PutSerializer(serializers.Serializer):
    function = serializers.CharField(required=True)

# TODO: add admin permissions
@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes((IsAuthenticated,))
def universes(request, universe = None):
    if request.method == "GET":
        response = []
        universes = Universe.objects.all()
        for universe in universes:
            response.append({
                "id": universe.id,
                "function": universe.function
            })
        return Response(response, status = HTTP_200_OK)
    elif request.method == "POST":
        if not universe is None:
            raise MethodNotAllowed("POST")
        serializer = PostSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        function = serializer.data["function"]
        # initial = serializer.data["initial"]
        initial = "x+y*1j"
        if Universe.objects.filter(function = function, initial_value = initial).exists():
            return Response({
                "function": _("Universe arleady exists.")
            }, status = HTTP_400_BAD_REQUEST)
        universe = Universe.objects.create(function = function, initial_value = initial)
        universe.save()
        return Response({
            "success": True,
            "id": universe.id
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
