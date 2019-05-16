
import hashlib
import ast
from django.conf import settings
from .models import Fractal, Drawable
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
    HTTP_200_OK
)
from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.core.paginator import Paginator, EmptyPage


class SearchSerializer(serializers.Serializer):
    keywords = serializers.CharField(allow_blank=True)
    page = serializers.IntegerField(required=True, min_value=1)


def search(Class, request, sfunction):
    plural_name = Class._meta.verbose_name_plural
    serializer = SearchSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    keywords = serializer.data["keywords"]
    if len(keywords) == 0:
        universes = Class.objects.all().order_by("-id")
    else:
        universes = Class.objects.filter(name__icontains = keywords).order_by("-id")
    paginator = Paginator(universes, settings.PAGINATOR_PAGES)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status = HTTP_404_NOT_FOUND)
    response = []
    for obj in page.object_list:
        response.append(sfunction(obj))
    return Response({
        "maxPages": paginator.num_pages,
        plural_name: response
    }, status=HTTP_200_OK)


def user_info(user, full=False):
    return {
        "id": user.id,
        "login": user.login,
        "email": full and user.email,
        "avatar": "https://www.gravatar.com/avatar/{}?s=128".format(hashlib.md5(user.email.lower().encode("utf-8")).hexdigest()),
        "isAdmin": user.is_staff,
        "isPremium": user.is_premium
    }


def fractal_info(fractal):
    drawables = []
    d = Drawable.objects.filter(fractal=fractal)
    for drawable in d:
        drawables.append(drawable_info(drawable))
    return {
        "id": fractal.id,
        "dimension": fractal.dimension.id,
        "drawables": drawables
    }


def drawable_info(drawable):
    return {
        "id": drawable.id,
        "url": drawable.image_url,
        "palette": drawable.palette.id,
        "state": Drawable.STATES[drawable.state][1]
    }


def dimension_info(dimension):
    return {
        "id": dimension.id,
        "name": dimension.name,
        "parameter": dimension.parameter,
        "universe": dimension.universe.id,
        "map": fractal_info(dimension.map)
    }


def palette_info(palette):
    return {
        "id": palette.id,
        "name": palette.name,
        "user": palette.user.id,
        "colors": ast.literal_eval(palette.colors),
        "gradations": palette.gradations
    }
