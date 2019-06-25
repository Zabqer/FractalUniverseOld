# from Equation import Expression
from PIL import Image, ImageDraw
from ast import literal_eval
from math import floor
from . import formula


def two_color_gradation(color1, color2, steps):
    colors = []
    alpha = 0
    for i in range(steps):
        color = floor(
            ((color1 & 0xFF) * alpha + (1 - alpha) * (color2 & 0xFF)) +
            (floor(((color1 >> 8) & 0xFF) * alpha + (1 - alpha) * ((color2 >> 8) & 0xFF)) << 8) +
            (floor(((color1 >> 16) & 0xFF) * alpha + (1 - alpha) * ((color2 >> 16) & 0xFF)) << 16)
        )
        colors.append(color)
        alpha += 1.0 / steps;
    return colors


def gradation_from_palette(palette):
    palette_colors = isinstance(palette.colors, str) and literal_eval(palette.colors) or palette.colors
    colors = []
    for i in range(len(palette_colors) - 1):
        colors += two_color_gradation(palette_colors[i + 1], palette_colors[i], palette.gradations)
    colors.append(palette_colors[len(palette_colors) - 1])
    return colors


def fill_array(at, to, point_count):
    if point_count == 1:
        step = 0
    else:
        step = (to - at + 0.0) / (point_count - 1)
    arr = []
    count = 0
    while count < point_count:
        arr.append(at + step * count)
        count = count + 1
    return arr


def calculate(function, initial_value, parameter, x, y):
    width = 600
    height = 600
    x1 = -2.5
    x2 = 1.5
    y1 = 2
    y2 = -2
    int_limit = 0.01
    ext_limit = 100
    max_step_count = 255
    step_map = []
    x_array = fill_array(x1, x2, width)
    y_array = fill_array(y1, y2, height)
    function = formula.compile(function)
    initial_value = formula.compile(initial_value)
    n = formula.compile(parameter)()
    z = x + y * 1j
    i = j = v = 0
    real_max_step = 0
    for x in x_array:
        step_map.append([])
        for y in y_array:
            v = initial_value(x=x, y=y)
            step = 0
            while step == 0 or ((abs(v) > int_limit) and (abs(v) < ext_limit)):
                if step >= max_step_count:
                    break
                v = function(v=v, n=n, z=z)
                step = step + 1
            if step > real_max_step:
                real_max_step = step
            step_map[i].append(step)
            j += 1
        # meta["progress"] = round((i + 1) / width, 2)
        print("Fractal progress " + str(round((i + 1) / width, 2)) + "    ", end="\r")
        i += 1
    return step_map, real_max_step


def calculate_map(function, initial_value, parameter):
    width = 600
    height = 600
    # TEMP:
    x1 = -2
    x2 = 2
    y1 = -2
    y2 = 2
    int_limit = 0.01
    ext_limit = 100
    max_step_count = 255
    # TEMP:
    step_map = []
    x_array = fill_array(x1, x2, width)
    y_array = fill_array(y1, y2, height)
    function = formula.compile(function)
    initial_value = formula.compile(initial_value)
    n = formula.compile(parameter)()
    i = j = v = 0
    real_max_step = 0
    for x in x_array:
        step_map.append([])
        for y in y_array:
            v = 1
            z = initial_value(x=x, y=y)
            step = 0
            while step == 0 or ((abs(v) > int_limit) and (abs(v) < ext_limit)):
                if step >= max_step_count:
                    break
                v = function(v=v, n=n, z=z)
                step = step + 1
            if step > real_max_step:
                real_max_step = step
            step_map[i].append(step)
            j += 1
        # meta["progress"] = round((i + 1) / width, 2)
        print("Fractal progress " + str(round((i + 1) / width, 2) * 100) + "%    ", end="\r")
        i += 1
    return step_map, real_max_step


class DefaultPalette():
    colors = [0x000000, 0xFFFFFF]
    gradations = 0


def image_from_map(step_map, max_steps, colors=None):
    if not colors:
        def_pal = DefaultPalette()
        def_pal.gradations = max_steps
        colors = gradation_from_palette(def_pal)
    width = len(step_map[0])
    height = len(step_map)
    color = colors[0]
    img = Image.new("RGB", (width, height), color)
    imgDrawer = ImageDraw.Draw(img)
    i = 0
    while i < width:
        j = 0
        while j < height:
            step = step_map[i][j]
            color = colors[step - 1]
            # WTF! Red and blue swapped 0_0
            imgDrawer.point((i, j), ((color & 0xFF) << 16) + (((color >> 8) & 0xFF) << 8) + (((color >> 16) & 0xFF)))
            j = j + 1
        i = i + 1
    # imgDrawer.text((0, 0), "FractalUniverse")
    return img
