from django.conf import settings
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework import serializers
from django.core.paginator import Paginator, EmptyPage
from rest_framework.response import Response
from django.utils.translation import ugettext_lazy as _


class SearchSerializer(serializers.Serializer):
    keywords = serializers.CharField(allow_blank=True)
    page = serializers.IntegerField(required=True, min_value=1)


def default_searchf(objects, keywords):
    if not keywords:
        return objects.all()
    else:
        return objects.filter(name__icontains=keywords)


def search(Class, request, filter, sfunction, *args, **kwargs):
    plural_name = "name" in kwargs and kwargs["name"] or str(Class._meta.verbose_name_plural)
    serializer = SearchSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    keywords = serializer.data["keywords"]
    universes = filter(Class.objects, len(keywords) != 0 and keywords).order_by("-id")
    paginator = Paginator(universes, settings.PAGINATOR_PAGES)
    try:
        page = paginator.page(serializer.data["page"])
    except EmptyPage:
        return Response({
            "detail": _("Page not found.")
        }, status=HTTP_404_NOT_FOUND)
    response = []
    for obj in page.object_list:
        response.append(sfunction(obj, *args))
    return Response({
        "maxPages": paginator.num_pages,
        plural_name: response
    }, status=HTTP_200_OK)
