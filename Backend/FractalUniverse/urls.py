from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api import auth, user, fractal
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from django.views.i18n import JavaScriptCatalog, JSONCatalog
from .fractal_utils import task_manager

def renderApp(request):
    return render(request, "index.html")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login", auth.login),
    path("api/auth/logout", auth.logout),
    path("api/user/info", user.info),
    path("api/user/<int:id>/info", user.info),
    path("api/user/palettes", user.palettes),
    path("api/fractals", fractal.fractals),
    path("api/fractals/<int:id>", fractal.fractals),
    path("api/fractals/latest", fractal.latest_fractals),
    path("jsi18n/", JavaScriptCatalog.as_view(packages=("FractalUniverse",)), name="javascript-catalog"),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^", renderApp),
]

task_manager.init_workers()
