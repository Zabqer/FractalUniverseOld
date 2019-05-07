from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api import auth, user, palette, universe, dimension, fractal, test
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from django.views.i18n import JavaScriptCatalog
from .fractal_utils import task_manager

def renderApp(request):
    return render(request, "index.html")

urlpatterns = [
# !!
    path("api/test", test.test),
# !!
    path("fake_admin/", admin.site.urls),
    path("api/auth/register", auth.register),
    path("api/auth/login", auth.login),
    path("api/auth/logout", auth.logout),
    path("api/user", user.user),
    path("api/palettes", palette.palettes),
    path("api/universes", universe.universes),
    path("api/universes/<int:universe>", universe.universes),
    path("api/universes/<int:universe>/dimensions", dimension.dimensions),
    path("api/universes/<int:universe>/dimensions/<int:dimension>", dimension.dimensions),
    path("api/dimensions/<int:dimension>", dimension.dimensions),
    path("api/fractals", fractal.fractals),
    path("api/user", user.user),
    path("jsi18n/", JavaScriptCatalog.as_view(packages=("FractalUniverse",)), name="javascript-catalog"),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^", renderApp),
]

task_manager.init_workers()
