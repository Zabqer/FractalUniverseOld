from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from datetime import timedelta
from django.utils import timezone
from .models import AuthToken

class ExpirableTokenAuthentication(TokenAuthentication):
    model = AuthToken
    def authenticate_credentials(self, key):
        try:
            token = AuthToken.objects.get(key = key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid Token")
        if token.expire_at <= timezone.now():
            token.delete()
            raise AuthenticationFailed("Token expire")
        if not token.user.is_active:
            raise AuthenticationFailed("User is not active")
        token.save()
        return token.user, token
