
import hashlib

def userInfo(user, full = False):
    return {
        "id": user.id,
        "login": user.login,
        "email": full and user.email,
        "avatar": "https://www.gravatar.com/avatar/" + hashlib.md5(user.email.lower().encode("utf-8")).hexdigest() + "?s=128"
    }
