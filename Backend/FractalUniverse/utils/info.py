import hashlib
import ast
from django.utils import timezone
import urllib.request


def user(user, request, full=False):
    return {
        "id": user.id,
        "username": user.login,
        "email": full and user.email,
        "avatar": "https://www.gravatar.com/avatar/{}?s=128".format(hashlib.md5(user.email.lower().encode("utf-8")).hexdigest()),
        "isAdmin": user.is_staff,
        "isPremium": user.is_premium,
        "verified": user.is_active,
        "blocked": user.is_blocked
    }


def fractal(fractal, request):
    if fractal.image_url:
        url = urllib.request.urlopen(fractal.image_url).geturl()
    else:
        url = None
    return {
        "id": fractal.id,
        "active": fractal.is_active,
        "dimension": fractal.dimension.id,
        "x": fractal.x,
        "y": fractal.y,
        "state": fractal.STATES[fractal.state][1],
        "url": url,
        "favorite": request.user and fractal.favorites.filter(user=request.user).exists() or False
    }


def universe(universe, request):
    return {
        "id": universe.id,
        "name": universe.name,
        "active": universe.is_active,
        "function": universe.function
    }


def dimension(dimension, request):
    return {
        "id": dimension.id,
        "name": dimension.name,
        "active": dimension.is_active,
        "parameter": dimension.parameter,
        "universe": dimension.universe.id,
        "map": fractal(dimension.map, request)
    }


def palette(palette, request):
    return {
        "id": palette.id,
        "name": palette.name,
        "user": palette.user and palette.user.id or None,
        "colors": isinstance(palette.colors, str) and ast.literal_eval(palette.colors) or palette.colors,
        "gradations": palette.gradations
    }


def task(task, request):
    return {
        "id": task.id,
        "fractal": fractal(task.fractal, request)
    }


def session(session, request, full=False):
    if session.expire_at and session.expire_at <= timezone.now():
        session.key = None
        session.expire_at = None
        session.save()
    return {
        "id": session.id,
        "key": session.key,
        "created": session.created,
        "remember": session.remember,
        "expireAt": session.expire_at,
        "user": session.user.id if full else None
    }
