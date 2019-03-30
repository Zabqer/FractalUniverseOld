from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from django.core.validators import int_list_validator
from django.utils.translation import ugettext_lazy as _
import binascii
import os

from .managers import UserManager

class User(AbstractBaseUser, PermissionsMixin):
    login = models.CharField("login", max_length=32, unique=True)
    email = models.EmailField("email", unique=True)
    password = models.CharField("password", max_length=256)
    date_joined = models.DateTimeField("registered", auto_now_add=True)
    is_active = models.BooleanField("is_active", default=True)
    is_premium = models.BooleanField("is_premium", default=False)
    is_staff = True
    objects = UserManager()
    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["email", "password"]
    class Meta:
        managed=True
        verbose_name = "user"
        verbose_name_plural = "users"

class Token(models.Model):
    key = models.CharField("key", max_length=40, primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="auth_tokens",
        on_delete=models.CASCADE, verbose_name="user"
    )
    remember = models.BooleanField("remember", default=True)
    created = models.DateTimeField("created", auto_now_add=True)
    expire_at = models.DateTimeField("expire_at", default=None)
    class Meta:
        verbose_name = "token"
        verbose_name_plural = "tokens"
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

class Palette(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="palettes",
        on_delete=models.CASCADE, verbose_name="user"
    )
    name = models.CharField("name", max_length=64)
    colors = models.CharField("colors", validators=(int_list_validator,), max_length=100)
    gradations = models.IntegerField("gradations")
    class Meta:
        verbose_name = "palette"
        verbose_name_plural = "palettes"
        unique_together = ("id", "user")
