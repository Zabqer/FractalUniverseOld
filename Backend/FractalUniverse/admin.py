from django.contrib import admin
from .models import Token, User
from django.contrib.auth.admin import UserAdmin

class UserAdmin(admin.ModelAdmin):
    list_display = ("login", "email", "date_joined")
    # fields = ("user",)

class TokenAdmin(admin.ModelAdmin):
    list_display = ("key", "user", "created", "remember", "expire_at")
    # fields = ("user",)


admin.site.register(User, UserAdmin)
admin.site.register(Token, TokenAdmin)
