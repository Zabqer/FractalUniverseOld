import os
import sys
from os.path import expanduser

path = expanduser("~") + "/FractalUniverse/Backend/"
if path not in sys.path:
    sys.path.insert(0, path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "FractalUniverse.settings")

os.environ.setdefault("WSGI", "True")

application = get_wsgi_application()
