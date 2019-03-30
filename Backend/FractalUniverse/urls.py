from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api import auth, user
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from django.views.i18n import JavaScriptCatalog, JSONCatalog

def renderApp(request):
    return render(request, "index.html")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login", auth.login),
    path("api/auth/logout", auth.logout),
    path("api/user/info", user.info),
    path("api/user/<int:id>/info", user.info),
    path("api/user/palettes", user.palettes),
    path("jsi18n/", JavaScriptCatalog.as_view(packages=("FractalUniverse",)), name="javascript-catalog"),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^", renderApp),
]
