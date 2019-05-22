from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api import auth, user, palette, universe, dimension, fractal, task, test
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from django.views.i18n import JavaScriptCatalog


def renderApp(request):
    return render(request, "index.html")


urlpatterns = [
# !!
    path("api/test", test.test),
    # path("sse/", sse.sse),
# !!
    path("fake_admin/", admin.site.urls),
    path("api/auth/register", auth.register),
    path("api/auth/activate", auth.activate),
    path("api/auth/login", auth.login),
    path("api/auth/logout", auth.logout),
    path("api/users", user.users),
    path("api/users/search", user.search),
    path("api/universes", universe.universes),
    path("api/universes/search", universe.search),
    path("api/universes/<int:universe>", universe.universes),
    path("api/universes/<int:universe>/dimensions", dimension.dimensions),
    path("api/universes/<int:universe>/dimensions/search", dimension.search),
    # path("api/universes/<int:universe>/dimensions/<int:dimension>", dimension.dimensions),
    path("api/dimensions/<int:dimension>", dimension.dimensions),
    path("api/tasks/search", task.search),
    path("api/palettes", palette.palettes),
    path("api/palettes/<int:id>", palette.palettes),
    path("api/palettes/search", palette.search),
    path("jsi18n/", JavaScriptCatalog.as_view(packages=("FractalUniverse",)), name="javascript-catalog"),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^", renderApp),
]
