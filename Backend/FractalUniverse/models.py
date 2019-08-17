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

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    login = models.CharField("login", max_length=32, unique=True)
    email = models.EmailField("email", unique=True)
    password = models.CharField("password", max_length=256)
    date_joined = models.DateTimeField("registered", auto_now_add=True)
    is_blocked = models.BooleanField("is_blocked", default=False)
    is_active = models.BooleanField("is_active", default=True)
    is_premium = models.BooleanField("is_premium", default=False)
    is_staff = models.BooleanField("is_staff", default=False)
    objects = UserManager()
    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["email", "password"]

    class Meta:
        managed=True


class AuthToken(models.Model):
    key = models.CharField("key", max_length=40, null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="auth_tokens",
        on_delete=models.CASCADE, verbose_name="user"
    )
    remember = models.BooleanField("remember", default=True)
    created = models.DateTimeField("created", auto_now_add=True)
    expire_at = models.DateTimeField("expire_at", null=True, blank=True)

    class Meta:
        verbose_name = "token"
        verbose_name_plural = "tokens"
        unique_together=("key", "user")

    def save(self, *args, **kwargs):
        if self.key:
            if self.remember:
                self.expire_at = timezone.now() + settings.REMEBERED_TOKEN_LIFETIME
            else:
                self.expire_at = timezone.now() + settings.TOKEN_LIFETIME
        return super(AuthToken, self).save(*args, **kwargs)

    def generate_key(self):
        self.key = binascii.hexlify(os.urandom(32)).decode()

    def __str__(self):
        return self.key


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="email_virification_tokens",
        on_delete=models.CASCADE, verbose_name="user"
    )
    key = models.CharField("key", max_length=40, primary_key=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super(EmailVerificationToken, self).save(*args, **kwargs)

    def generate_key(self):
        return binascii.hexlify(os.urandom(32)).decode()


class Palette(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="palettes",
        on_delete=models.CASCADE, verbose_name="user",
        blank=True, null=True
    )
    name = models.CharField("name", max_length=64)
    colors = models.CharField("colors", validators=(int_list_validator,), max_length=100)
    gradations = models.IntegerField("gradations")

    class Meta:
        unique_together = ("id", "user")


class Universe(models.Model):  # Вселенная
    function = models.TextField(max_length=200)  # Формула для просчёта
    initial_value = models.TextField(max_length=40)  # Начальное значение для точки x+1j*y
    is_active = models.BooleanField(default=True)
    name = models.TextField()


class Dimension(models.Model):  # Измерение
    universe = models.ForeignKey(
        "Universe", related_name="dimensions",
        on_delete=models.CASCADE, verbose_name="universe"
    )  # Указатель на вселенную
    is_active = models.BooleanField(default=True)
    map = models.ForeignKey(
        "Fractal", related_name="dimensions",
        on_delete=models.CASCADE, verbose_name="fractal",
        null=True, blank=True
    )  # Измерение
    parameter = models.TextField()  # Параметр
    name = models.TextField()


class Fractal(models.Model):
    STATE_UNKNOWN = 0
    STATE_IN_QUEUE = 1
    STATE_CALCULATING = 2
    STATE_READY = 3
    STATES = (
        (STATE_UNKNOWN, "UNKNOWN"),
        (STATE_IN_QUEUE, "IN_QUEUE"),
        (STATE_CALCULATING, "CALCULATING"),
        (STATE_READY, "FINISHED")
    )
    is_active = models.BooleanField(default=True)
    state = models.IntegerField(choices=STATES, default=0)  # Статус фрактала (или карты)
    dimension = models.ForeignKey(
        "Dimension", related_name="fractals",
        on_delete=models.CASCADE, verbose_name="dimension"
    )  # Измерение
    x = models.FloatField()  # Коардинаты
    y = models.FloatField()  # т.е v=x+y*1j
    created = models.DateTimeField(auto_now_add=True)
    file_id = models.TextField(max_length=40, null=True)
    image_url = models.URLField(null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="fractals",
        on_delete=models.CASCADE, verbose_name="user",
        blank=True, null=True
    )


class UserFavorite(models.Model):
    fractal = models.ForeignKey(
        "Fractal", related_name="favorites",
        on_delete=models.CASCADE, verbose_name="fractal"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="favorites",
        on_delete=models.CASCADE, verbose_name="user"
    )

    class Meta():
        unique_together = ("fractal", "user")


class FractalRating(models.Model):
    LIKE = 1
    DISLIKE = -1
    RATES = (
        (LIKE, "Like"),
        (DISLIKE, "Dislike")
    )
    fractal = models.ForeignKey(
        "Fractal", related_name="ratings",
        on_delete=models.CASCADE, verbose_name="fractal"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="ratings",
        on_delete=models.CASCADE, verbose_name="user"
    )
    rate = models.SmallIntegerField(choices=RATES)

    class Meta():
        unique_together = ("fractal", "user")


class Comment(models.Model):
    fractal = models.ForeignKey(
        "Fractal", related_name="comments",
        on_delete=models.CASCADE, verbose_name="fractal"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="comments",
        on_delete=models.CASCADE, verbose_name="user"
    )
    date = models.DateTimeField(auto_now_add=True)
    content = models.TextField()


class FractalCalculateTask(models.Model):
    fractal = models.ForeignKey(
        "Fractal", related_name="fractalcalculatetasks",
        on_delete=models.CASCADE, verbose_name="fractal"
    )
    addTime = models.DateTimeField("addTime", auto_now_add=True)
    startTime = models.DateTimeField("startTime", null=True)
    endTime = models.DateTimeField("endTime", null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="fractalcalculatetasks",
        on_delete=models.CASCADE, verbose_name="user"
    )
