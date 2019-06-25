from django.conf import settings
from . import gdrive
from . import fractal as f
from ..models import Palette, Fractal, FractalCalculateTask
from django.utils import timezone


def calculate(fractal, user):
    print("Fractal " + str(fractal.id) + " added to queue")
    fractal.state = Fractal.STATE_IN_QUEUE
    fractal.save()
    FractalCalculateTask.objects.create(fractal=fractal, user=user)


def perform_tasks():
    print("Performing tasks...")
    # STATE_IN_QUEUE
    # STATE_CALCULATING
    fractals_to_calculate = Fractal.objects.filter(state=Fractal.STATE_IN_QUEUE)
    tasks = FractalCalculateTask.objects.filter(fractal__in=fractals_to_calculate)
    for task in tasks:
        task.startTime = timezone.now()
        task.save()
        fractal = task.fractal
        fractal.state = Fractal.STATE_CALCULATING
        fractal.save()
        if fractal.id == fractal.dimension.map.id:
            print("Calculating map " + str(fractal.id))
            step_map, max_steps = f.calculate_map(
                fractal.dimension.universe.function,
                fractal.dimension.universe.initial_value,
                fractal.dimension.parameter
            )
        else:
            print("Calculating fractal " + str(fractal.id))
            step_map, max_steps = f.calculate(
                fractal.dimension.universe.function,
                fractal.dimension.universe.initial_value,
                fractal.dimension.parameter,
                fractal.x,
                fractal.y
            )
        image = f.image_from_map(
            step_map,
            max_steps
        )
        (fractal.file_id, fractal.image_url) = gdrive.addFractalImage(str(fractal.id), image)
        fractal.state = Fractal.STATE_READY
        fractal.save()
        task.endTime = timezone.now()
        task.save()
    print("Ended")
