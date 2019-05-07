from threading import Thread
from django.conf import settings
from . import gdrive, fractal
from multiprocessing import Process, Queue
# from ..models import Dimension

queue = Queue()

def worker(queue):
    while True:
        drawableObj = queue.get()
        print("Got drawable: " + str(drawableObj.id))
        drawableObj.state = fractalObj.STATE_CALCULATING
        # fractalObj.save()
        # gradation = fractal.gradation_from_palette(fractalObj.palette)
        # step_map = fractal.calculate_map(
        #     fractalObj.dimension.universe.function,
        #     fractalObj.dimension.universe.initial_value,
        #     fractalObj.dimension.parameter,
        #     # fractalObj.x,
        #     # fractalObj.y
        # )
        # image = fractal.image_from_map(
        #     step_map,
        #     gradation
        # )
        # image.show()
        # (fractalObj.file_id, fractalObj.image_url) = gdrive.addFractalImage(fractalObj.id, image)
        drawableObj.state = drawableObj.STATE_READY
        drawableObj.save()

def init_workers():
    pass
    for _ in range(settings.CALCULATOR_THREAD_COUNT):
        process = Process(target=worker, args=(queue,))
        process.daemon = True
        process.start()

def calculate(drawable):
    drawable.state = drawable.STATE_IN_QUEUE
    queue.put(drawable)

def info(fractal):
    # for th, id, meta in tasks:
    #     if id == fractal.id:
    #         return {
    #             "progress": meta["progress"]
    #         }
    return None
