from django.conf import settings
from . import gdrive, fractal
from ..models import Drawable, DrawableCalculateTask
from django.utils import timezone

# def worker(queue):
#     while True:
#         drawableObj = queue.get()
#         print("Got drawable: " + str(drawableObj.id))
#         drawableObj.state = drawableObj.STATE_CALCULATING
#         drawableObj.save()
#         gradation = fractal.gradation_from_palette(drawableObj.palette)
#         step_map = fractal.calculate_map(
#             drawableObj.fractal.dimension.universe.function,
#             drawableObj.fractal.dimension.universe.initial_value,
#             drawableObj.fractal.dimension.parameter
#         )
#         image = fractal.image_from_map(
#             step_map,
#             gradation
#         )
#         # image.show()
#         (drawableObj.file_id, drawableObj.image_url) = gdrive.addFractalImage(str(drawableObj.fractal.id) + "_" + str(drawableObj.palette.id), image)
#         drawableObj.state = drawableObj.STATE_READY
#         drawableObj.save()

# def init_workers():
#     pass
#     for _ in range(settings.CALCULATOR_THREAD_COUNT):
#         process = Process(target=worker, args=(queue,))
#         process.daemon = True
#         process.start()

def calculate(drawable):
    print("Drawable " + str(drawable.id) + " added to queue")
    drawable.state = Drawable.STATE_IN_QUEUE
    drawable.save()
    DrawableCalculateTask.objects.create(drawable = drawable)

def perform_tasks():
    print("Performing tasks...")
    tasks = DrawableCalculateTask.objects.filter(state=Drawable.STATE_IN_QUEUE)
    for task in tasks:
        task.startTime = timezone.now()
        task.save()
        drawable = task.drawable
        drawable.state = Drawable.STATE_CALCULATING
        drawable.save()
        print("Calculating drawable " + str(drawable.id))
        gradation = fractal.gradation_from_palette(drawable.palette)
        step_map = fractal.calculate_map(
            drawable.fractal.dimension.universe.function,
            drawable.fractal.dimension.universe.initial_value,
            drawable.fractal.dimension.parameter
        )
        image = fractal.image_from_map(
            step_map,
            gradation
        )
        (drawable.file_id, drawable.image_url) = gdrive.addFractalImage(str(drawable.fractal.id) + "_" + str(drawable.palette.id), image)
        drawable.state = Drawable.STATE_READY
        drawable.save()
        task.endTime = timezone.now()
        task.save()
    print("Ended")
