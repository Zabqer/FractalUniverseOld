from rest_framework.views import APIView
from django.conf import settings
from rest_framework import serializers
import json
import urllib
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.response import Response
from django.utils.translation import ugettext_lazy as _
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator, EmptyPage


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[-1].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


class CaptchaValidator():
    captcha = serializers.CharField(required=True)

    def validate_captcha(self, data):
        if settings.DEBUG:
            return
        req = urllib.request.Request("https://www.google.com/recaptcha/api/siteverify", urllib.parse.urlencode({
            "secret": settings.GRECAPTCHA_PRIVATE_KEY,
            "response": data,
            "remoteip": get_client_ip(self.context.get("request"))
        }).encode("utf-8"))
        response = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
        if not response["success"]:
            raise serializers.ValidationError(response["error-codes"])


class APIViewWithPermissions(APIView):
    def get_permissions(self):
        try:
            return [f() for f in getattr(self, self.request.method.lower()).permissions]
        except AttributeError:
            return self.permission_classes or AllowAny()

    def get_throttles(self):
        self.throttle_scope = self.scope + "." + self.request.method.lower()
        return super().get_throttles()


def with_permissions(permissions):
    def decorator(fn):
        fn.permissions = permissions
        return fn
    return decorator


class SearchSerializer(serializers.Serializer):
    keywords = serializers.CharField(allow_blank=True)
    page = serializers.IntegerField(required=True, min_value=1)


class APIViewSearch(APIViewWithPermissions):

    def get_permissions(self):
        if self.request.method == "POST":
            return [f() for f in getattr(self, "search").permissions]
        return self.permission_classes or AllowAny()

    def post(self, request, **kwargs):
        try:
            params = self.prepare(**kwargs) or {}
            if isinstance(params, Response):
                return params
        except AttributeError:
            params = {}
        try:
            plural_name = self.name
        except AttributeError:
            plural_name = str(self.model._meta.verbose_name_plural)
        serializer = SearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        keywords = serializer.data["keywords"]
        universes = self.search(self.model.objects, len(keywords) != 0 and keywords, **params).order_by("-id")
        paginator = Paginator(universes, settings.PAGINATOR_PAGES)
        try:
            page = paginator.page(serializer.data["page"])
        except EmptyPage:
            return Response({
                "detail": _("Page not found.")
            }, status=HTTP_404_NOT_FOUND)
        response = []
        for obj in page.object_list:
            response.append(self.serializer[0](obj, *self.serializer[1:]))
        return Response({
            "maxPages": paginator.num_pages,
            plural_name: response
        }, status=HTTP_200_OK)

    def search(self, objects, keywords):
        if not keywords:
            return objects.all()
        else:
            return objects.filter(name__icontains=keywords)
