from django.contrib import admin
from django.urls import path, re_path
from FractalUniverse.api import session, user, universe, dimension, fractal, task, palette
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from django.views.i18n import JavaScriptCatalog


def renderApp(request):
    return render(request, "index.html")


urlpatterns = [
# !!
    # path("sse/", sse.sse),
# !!
    path("fake_admin/", admin.site.urls),
    # TODO: Impliment more methods
    path("api/session", session.View.as_view()),
    # POST - Create new session (Login) (Any)
    # DELETE - Delete session (Logout) (Authenticated)
    path("api/user", user.View.as_view()),  # TODO: User info by id
    # GET - Get user info (Authenticated)
    # POST - Register new user (Any)
    # TODO: PUT - Edit user info (Authenticated)
    # DELTE - Delete user (Authenticated)
    path("api/user/activate", user.ActivateView.as_view()),
    # POST - Activate user (Any)
    path("api/user/search", user.SearchView.as_view()),
    # POST - Search all users (Admin)
    path("api/universe", universe.View.as_view()),
    # POST - Add new universe (Admin)
    path("api/universe/<int:universe>", universe.View.as_view()),
    # GET - Get universe info (Any)
    # DELETE - Delete universe (Admin)
    path("api/universe/search", universe.SearchView.as_view()),
    # POST - Search all universes (Any)
    path("api/universe/<int:universe>/dimension", dimension.View.as_view()),
    # POST - Add new dimension (Admin)
    path("api/universe/<int:universe>/dimension/search", dimension.SearchView.as_view()),
    # POST - Search all dimensions in universe
    path("api/dimension/<int:dimension>", dimension.View.as_view()),
    # GET - Get dimension info (Any)
    # DELETE - Delete dimension (Admin)
    path("api/dimension/search", dimension.SearchView.as_view()),
    # POST - Search all dimensions (Any)
    path("api/dimension/<int:dimension>/fractal", fractal.View.as_view()),
    # POST - Add new fractal (Primium)
    path("api/dimension/<int:dimension>/fractal/search", fractal.SearchView.as_view()),
    # POST - Search all fractals in dimension (Any)
    path("api/task/search", task.SearchView.as_view()),
    # POST - Search tasks (Authenticated)
    path("api/user/task/search", task.UserSearchView.as_view()),
    # POST - Search user tasks (Authenticated)
    path("api/palette", palette.View.as_view()),
    # POST - Add new palette (Premium)
    path("api/palette/<int:palette>", palette.View.as_view()),
    # GET - Get palette info (Any)
    # TODO: PUT - Edit palette (Authenticated)
    # DELETE - Delete palette (Authenticated)
    path("api/palette/search", palette.SearchView.as_view()),
    # POST - Search all palettes (Any)
    path("api/palette/default", palette.DefaultView.as_view()),
    # GET - Get season palette (Any)
    path("api/user/palette/search", palette.UserSearchView.as_view()),
    # POST - Search user palettes (Authenticated)
    path("jsi18n/", JavaScriptCatalog.as_view(packages=("FractalUniverse",)), name="javascript-catalog"),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    re_path("^(?!api/)", renderApp),
]
