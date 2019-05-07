
import hashlib
from .models import Fractal

def user_info(user, full = False):
    return {
        "id": user.id,
        "login": user.login,
        "email": full and user.email,
        "avatar": "https://www.gravatar.com/avatar/" + hashlib.md5(user.email.lower().encode("utf-8")).hexdigest() + "?s=128",
        "isAdmin": user.is_staff,
        "isPremium": user.is_premium
    }

def fractal_info(fractal):
    return {
        "id": fractal.id,
        "dimension": fractal.dimension.id
        # "drawables": fractal.drawables
    }
