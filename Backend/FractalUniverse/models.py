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
import hashlib
from .fractal_utils import task_manager

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

class Universe(models.Model):
    function = models.TextField(max_length=200)
    initial_value = models.TextField(max_length=40)

class Dimension(models.Model):
    universe = models.ForeignKey(
        "Universe", related_name="dimensions",
        on_delete=models.CASCADE, verbose_name="universe"
    )
    params = models.TextField(max_length=40)

class Fractal(models.Model):
    STATE_UNKNOWN = 0
    STATE_IN_QUEUE = 1
    STATE_CALCULATING = 2
    STATE_READY = 3
    STATES = (
        (STATE_UNKNOWN, "UNKNOWN"),
        (STATE_IN_QUEUE, "IN_QUEUE"),
        (STATE_CALCULATING, "CALCULATING"),
        (STATE_READY, "READY")
    )
    palette = models.ForeignKey(
        "Palette", related_name="fractals",
        on_delete=models.CASCADE, verbose_name="palette"
    )
    state = models.IntegerField(choices=STATES, default=0)
    dimension = models.ForeignKey(
        "Dimension", related_name="fractals",
        on_delete=models.CASCADE, verbose_name="dimension"
    )
    created = models.DateTimeField(auto_now_add=True)
    width = models.IntegerField()
    height = models.IntegerField()
    file_id = models.TextField(max_length=40, null=True)
    image_url = models.URLField(null=True)
    class Meta:
        verbose_name = "fractal"
        verbose_name_plural = "fractals"

class FractalCalculateTask(models.Model):
    fractal = models.ForeignKey(
        "Fractal", related_name="fractalcalculatetasks",
        on_delete=models.CASCADE, verbose_name="fractal"
    )
    startTime = models.DateTimeField("startTime", auto_now_add=True)
