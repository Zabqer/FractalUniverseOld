from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils.translation import ugettext_lazy as _
import binascii
import os

from .managers import UserManager

class User(AbstractBaseUser, PermissionsMixin):
    login = models.CharField(_("login"), max_length=32, unique=True)
    email = models.EmailField(_("email"), unique=True)
    password = models.CharField(_("password"), max_length=256)
    date_joined = models.DateTimeField(_("registered"), auto_now_add=True)
    is_active = models.BooleanField(_("is_active"), default=True)
    is_staff = True
    # avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    objects = UserManager()
    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["email", "password"]
    class Meta:
        managed=True
        verbose_name = _("user")
        verbose_name_plural = _("users")

class Token(models.Model):
    key = models.CharField(_("key"), max_length=40, primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="auth_tokens",
        on_delete=models.CASCADE, verbose_name=_("user")
    )
    remember = models.BooleanField(_("remember"), default=True)
    created = models.DateTimeField(_("created"), auto_now_add=True)
    expire_at = models.DateTimeField(_("expire_at"), default=None)
    class Meta:
        verbose_name = _("token")
        verbose_name_plural = _("tokens")
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        if self.remember:
            self.expire_at = timezone.now() + settings.REMEBERED_TOKEN_LIFETIME
        else:
            self.expire_at = timezone.now() + settings.TOKEN_LIFETIME
        return super(Token, self).save(*args, **kwargs)
    def generate_key(self):
        return binascii.hexlify(os.urandom(32)).decode()
    def __str__(self):
        return self.key
