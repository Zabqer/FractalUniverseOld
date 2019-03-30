from django.contrib import admin
from .models import Token, User, Palette
from django.contrib.auth.admin import UserAdmin

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "login", "email", "date_joined")

class TokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user", "created", "remember", "expire_at")

class PaleteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "colors")


admin.site.register(User, UserAdmin)
admin.site.register(Token, TokenAdmin)
admin.site.register(Palette, PaleteAdmin)
