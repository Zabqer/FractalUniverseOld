import hashlib
import ast


def user(user, full=False):
    return {
        "id": user.id,
        "login": user.login,
        "email": full and user.email,
        "avatar": "https://www.gravatar.com/avatar/{}?s=128".format(hashlib.md5(user.email.lower().encode("utf-8")).hexdigest()),
        "isAdmin": user.is_staff,
        "isPremium": user.is_premium,
        "verified": user.is_active
    }


def fractal(fractal):
    return {
        "id": fractal.id,
        "dimension": fractal.dimension.id,
        "x": fractal.x,
        "y": fractal.y,
        "state": fractal.STATES[fractal.state][1],
        "url": fractal.image_url
    }


def universe(universe):
    return {
        "id": universe.id,
        "name": universe.name,
        "function": universe.function
    }


def dimension(dimension):
    return {
        "id": dimension.id,
        "name": dimension.name,
        "parameter": dimension.parameter,
        "universe": dimension.universe.id,
        "map": fractal(dimension.map)
    }


def palette(palette):
    return {
        "id": palette.id,
        "name": palette.name,
        "user": palette.user and palette.user.id or None,
        "colors": isinstance(palette.colors, str) and ast.literal_eval(palette.colors) or palette.colors,
        "gradations": palette.gradations
    }


def task(task):
    return {
        "id": task.id,
        "fractal": fractal(task.fractal)
    }
