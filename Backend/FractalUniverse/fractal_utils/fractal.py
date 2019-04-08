# from Equation import Expression
from PIL import Image, ImageDraw
import sys
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
    palette_colors = literal_eval(palette.colors)
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

# TODO: change eval to custom eval with AST parser
def calculate(function, initial_value, params, width, height, max_step_count, meta):
    # TEMP:
    x1 = -2
    x2 = 2
    y1 = -2
    y2 = 2
    int_limit = 0.01
    ext_limit = 100
    # TEMP:
    step_map = []
    x_array = fill_array(x1, x2, width)
    y_array = fill_array(y1, y2, height)
    function = formula.compile(function)
    initial_value = formula.compile(initial_value)
    (n, z) = [formula.compile(ex)() for ex in params.split(",")]
    i = j = v = 0
    for x in x_array:
        step_map.append([])
        for y in y_array:
            v = initial_value(x = x, y = y)
            step = 0
            while ((abs(v) > int_limit) and (abs(v) < ext_limit)):
                if step >= max_step_count:
                    break
                v = function(v = v, n = n, z = z)
                step = step + 1
            step_map[i].append(step)
            j += 1
        meta["progress"] = round((i + 1) / width, 2)
        i += 1
    return step_map

def image_from_map(step_map, width, height, colors):
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
    imgDrawer.text((0, 0), "FractalUniverse")
    return img
