from django.contrib import admin
from .models import Token, User, Palette, Fractal, Dimension, Universe
from django.contrib.auth.admin import UserAdmin

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "login", "email", "date_joined")

class TokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user", "created", "remember", "expire_at")

class PaleteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "colors", "gradations")

class FractalAdmin(admin.ModelAdmin):
    list_display = ("id", "dimension", "palette", "state", "created", "image_url")

class DimensionAdmin(admin.ModelAdmin):
    list_display = ("id", "universe", "params")

class UniverseAdmin(admin.ModelAdmin):
    list_display = ("id", "function", "initial_value")


admin.site.register(User, UserAdmin)
admin.site.register(Token, TokenAdmin)
admin.site.register(Palette, PaleteAdmin)
admin.site.register(Fractal, FractalAdmin)
admin.site.register(Dimension, DimensionAdmin)
admin.site.register(Universe, UniverseAdmin)
