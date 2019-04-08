from threading import Thread
from django.conf import settings
from . import gdrive, fractal
from multiprocessing import Process, Queue

queue = Queue()

def worker(queue):
    while True:
        fractalObj = queue.get()
        fractalObj.state = fractalObj.STATE_CALCULATING
        fractalObj.save()
        gradation = fractal.gradation_from_palette(fractalObj.palette)
        step_map = fractal.calculate(
            fractalObj.dimension.universe.function,
            fractalObj.dimension.universe.initial_value,
            fractalObj.dimension.params,
            fractalObj.width,
            fractalObj.height,
            len(gradation),
            {}
        )
        image = fractal.image_from_map(
            step_map,
            fractalObj.width,
            fractalObj.height,
            gradation
        )
        (fractalObj.file_id, fractalObj.image_url) = gdrive.addFractalImage(fractalObj.id, image)
        fractalObj.state = fractalObj.STATE_READY
        fractalObj.save()

def init_workers():
    for _ in range(settings.CALCULATOR_THREAD_COUNT):
        process = Process(target=worker, args=(queue,))
        process.daemon = True
        process.start()

def calculate(fractal):
    fractal.state = fractal.STATE_IN_QUEUE
    queue.put(fractal)

def info(fractal):
    # for th, id, meta in tasks:
    #     if id == fractal.id:
    #         return {
    #             "progress": meta["progress"]
    #         }
    return None
