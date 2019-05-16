export function decimal2hex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex.toUpperCase();
}

function generateGradation(from, to, steps) {
  let colors = []
  let alpha = 0;
  for (let j = 0; j < steps; j++) {
    let color = Math.floor(((from & 0xFF) * alpha + (1 - alpha) * (to & 0xFF)) + ((((from >> 8) & 0xFF) * alpha + (1 - alpha) * ((to >> 8) & 0xFF)) << 8) + ((((from >> 16) & 0xFF) * alpha + (1 - alpha) * ((to >> 16) & 0xFF)) << 16));
    colors.push(color)
      alpha += 1.0 / steps;
  }
  return colors;
}

export function generatePalette(colors, steps) {
  let gradations = []
  for (let i = 0; i < colors.length - 1; i++) {
    console.log(colors[i])
    gradations = gradations.concat(generateGradation(colors[i + 1], colors[i], steps));
  }
  gradations.push(colors[colors.length - 1]);
  return gradations;
}

export function rgb2hsv(color) {
  let r = ((color >> 16) & 0xFF) / 255;
  let g = ((color >> 8) & 0xFF) / 255;
  let b = (color & 0xFF) / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;
  var d = max - min;
  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [ h, s, v ];
}

export function hsv2rgb(h, s, v) {
  var r, g, b;
  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return Math.floor(((r * 255) << 16) + ((g * 255) << 8) + b * 255);
}
