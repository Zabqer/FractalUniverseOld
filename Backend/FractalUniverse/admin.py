from django.contrib import admin
from .models import Token, User, Palette, Fractal, Dimension, Universe, Drawable, DrawableCalculateTask
from django.contrib.auth.admin import UserAdmin

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "login", "email", "date_joined")

class TokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user", "created", "remember", "expire_at")

class PaleteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "colors", "gradations")

class FractalAdmin(admin.ModelAdmin):
    list_display = ("id", "dimension", "x", "y", "default_drawable")

class DimensionAdmin(admin.ModelAdmin):
    list_display = ("id", "universe", "parameter", "map")

class UniverseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "function", "initial_value")


class DrawableAdmin(admin.ModelAdmin):
    list_display = ("id", "fractal", "palette", "state", "created", "image_url", "file_id")


class DrawableCalculateTaskAdmin(admin.ModelAdmin):
    list_display = ("drawable", "addTime", "startTime")


admin.site.register(User, UserAdmin)
admin.site.register(Token, TokenAdmin)
admin.site.register(Palette, PaleteAdmin)
admin.site.register(Fractal, FractalAdmin)
admin.site.register(Dimension, DimensionAdmin)
admin.site.register(Universe, UniverseAdmin)
admin.site.register(Drawable, DrawableAdmin)
admin.site.register(DrawableCalculateTask, DrawableCalculateTaskAdmin)
