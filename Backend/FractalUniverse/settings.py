import os
from datetime import timedelta
from django.utils.translation import ugettext_lazy as _

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = "7aiuz#h#c$n*3adaaxk%lxw1t7o-onj!08g@-kb3!yrzm^8h&o"

DEBUG = True

ALLOWED_HOSTS = ["localhost", "192.168.1.100", "zabqer.pythonanywhere.com", "lproph.pythonanywhere.com"]

AUTH_USER_MODEL = "FractalUniverse.User"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "FractalUniverse"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    'django.middleware.locale.LocaleMiddleware',
    # "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

LANGUAGES = (
    ("ru", _("Russian")),
    ("en", _("English")),
)

LANGUAGE_CODE = "en"

LOCALE_PATHS = (
    os.path.join(BASE_DIR, "locale"),
)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "FractalUniverse.auth.ExpirableTokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated", )
}

ROOT_URLCONF = "FractalUniverse.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR + "/templates/"
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "FractalUniverse.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = "/static/"

if os.environ.get("WSGI") == "True":
    STATIC_ROOT = os.path.join(BASE_DIR, "static")
else:
    STATICFILES_DIRS = (
        os.path.join(BASE_DIR, "static"),
    )

# FractalUniverse

GRECAPTCHA_PRIVATE_KEY = "6Ld_dZYUAAAAAFNGKcVLH0nA3OwcJf0BVZD-2H8r"

TOKEN_LIFETIME = timedelta(hours=1)
REMEBERED_TOKEN_LIFETIME = timedelta(weeks=1)

GOOGLE_API_AUTH_FILE = os.path.join(BASE_DIR, "GoogleServiceAccount.json")

PAGINATOR_PAGES = 10
