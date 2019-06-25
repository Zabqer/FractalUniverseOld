from django.contrib import admin
from .models import AuthToken, User, Palette, Fractal, Dimension, Universe, FractalCalculateTask, EmailVerificationToken
from django.contrib.auth.admin import UserAdmin


class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "login", "email", "date_joined")


class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user", "created", "remember", "expire_at")


class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user")


class PaleteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "colors", "gradations")


class FractalAdmin(admin.ModelAdmin):
    list_display = ("id", "dimension", "x", "y", "image_url", "file_id", "state", "user")


class DimensionAdmin(admin.ModelAdmin):
    list_display = ("id", "universe", "parameter", "map")


class UniverseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "function", "initial_value")


class FractalCalculateTaskAdmin(admin.ModelAdmin):
    list_display = ("fractal", "addTime", "startTime", "endTime", "user")


admin.site.register(User, UserAdmin)
admin.site.register(AuthToken, AuthTokenAdmin)
admin.site.register(EmailVerificationToken, EmailVerificationTokenAdmin)
admin.site.register(Palette, PaleteAdmin)
admin.site.register(Fractal, FractalAdmin)
admin.site.register(Dimension, DimensionAdmin)
admin.site.register(Universe, UniverseAdmin)
admin.site.register(FractalCalculateTask, FractalCalculateTaskAdmin)
