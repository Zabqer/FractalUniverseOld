from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from datetime import timedelta
from django.utils import timezone
from .models import AuthToken

class ExpirableTokenAuthentication(TokenAuthentication):
    model = AuthToken
    def authenticate_credentials(self, key):
        try:
            token = AuthToken.objects.get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid Token")
        if token.expire_at <= timezone.now():
            token.key = None
            token.expire_at = None
            token.save()
            raise AuthenticationFailed("Token expire")
        if not token.user.is_active:
            raise AuthenticationFailed("User is not active")
        if token.user.is_blocked:
            raise AuthenticationFailed("User blocked")
        token.save()
        return token.user, token
