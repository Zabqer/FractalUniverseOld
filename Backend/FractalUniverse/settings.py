import os
from datetime import timedelta
from django.utils.translation import ugettext_lazy as _
from . import secretconfig

# Secretconfig

import sys

self = sys.modules[__name__]
for name, value in secretconfig.__dict__.items():
    setattr(self, name, value)

# Other

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True

ALLOWED_HOSTS = ["localhost", "192.168.1.100", "zabqer.pythonanywhere.com", "lprohl.pythonanywhere.com"]

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
    "django.middleware.locale.LocaleMiddleware",
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
        "rest_framework.permissions.IsAuthenticated", ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.ScopedRateThrottle", ),
    "DEFAULT_THROTTLE_RATES": {
        "session.post": "6/minute",
        "session.delete": "1/second",
        "user.get": "1/second",
        "user.post": "2/hour",
        "user.delete": "1/second",
        "user-activate.post": "1/second",
        "user-search.post": "1/second",
        "universe.post": "1/second",
        "universe.get": "1/second",
        "universe.delete": "1/second",
        "universe-search.post": "1/second",
        "dimension.get": "1/second",
        "dimension.post": "1/second",
        "dimension.delete": "1/second",
        "dimension-search.post": "1/second",
        "fractal.post": "2/hour",
        "fractal-search.post": "1/second",
        "task-search.post": "1/second",
        "user-task-search.post": "1/second",
        "palette.get": "1/second",
        "palette.post": "1/second",
        "palette.delete": "1/second",
        "palette-search.post": "1/second",
        "palette-default.get": "1/second",
        "user-palette-search.post": "1/second"
    }
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

TOKEN_LIFETIME = timedelta(hours=1)
REMEBERED_TOKEN_LIFETIME = timedelta(weeks=1)

GOOGLE_API_AUTH_FILE = os.path.join(BASE_DIR, "GoogleServiceAccount.json")

PAGINATOR_PAGES = 10

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_USE_TLS = True
EMAIL_PORT = 587
