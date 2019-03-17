from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api.auth import login, test
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static

def renderApp(request):
    return render(request, "index.html")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login", login),
    path("api/test", test),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^", renderApp),
]
