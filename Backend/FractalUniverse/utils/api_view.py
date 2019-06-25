from rest_framework.views import APIView
from django.conf import settings
from rest_framework import serializers
import json
import urllib

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
            return self.permission_classes


def with_permissions(permissions):
    def decorator(fn):
        fn.permissions = permissions
        return fn
    return decorator
