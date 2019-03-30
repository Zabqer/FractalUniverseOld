from django.conf import settings
from rest_framework import serializers

import json
import urllib

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class UserSigninSerializer(serializers.Serializer):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    remember = serializers.BooleanField(required=True)
    captcha = serializers.CharField(required=True)
    def validate_captcha(self, data):
        req = urllib.request.Request("https://www.google.com/recaptcha/api/siteverify", urllib.parse.urlencode({
            "secret": getattr(settings, "GRECAPTCHA_PRIVATE_KEY"),
            "response": data,
            "remoteip": get_client_ip(self.context.get("request"))
        }).encode("utf-8"))
        response = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
        print(response)
        if not response["success"]:
            raise serializers.ValidationError("reCAPTCHA error: " + str(response["error-codes"]))

class UserPostPlalette(serializers.Serializer):
    name = serializers.CharField(required=True)
    gradations = serializers.IntegerField(required=True, min_value=0, max_value=40)
    colors = serializers.ListField(
        child = serializers.IntegerField(min_value=0, max_value=16777215)
    )

class UserDeletePlalette(serializers.Serializer):
    id = serializers.IntegerField()
