import os
import sys

path = "~/FractalUniverse/"
if path not in sys.path:
    sys.path.insert(0, path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "FractalUniverse.settings")

application = get_wsgi_application()
