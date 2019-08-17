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

export function elementOffset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, width: rect.width, height: rect.height }
}

let iid = 0;

export async function generateImage(url, palette) {
  return new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
      var fr = new FileReader();
      fr.onload = function() {
        let img = new Image();
        img.src = this.result;
        let canvas = document.createElement("canvas");
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          let ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          let image = ctx.getImageData(0, 0, img.width, img.height);
          let data = image.data;
          let replaceMap = {}
          for (let i = 0; i < data.length; i += 4) {
            let color = data[i] + (data[i + 1] << 8) + (data[i + 2] << 16);
            if (!replaceMap[color]) {
              replaceMap[color] = true
            }
          }
          let gradations = Object.keys(replaceMap);
          let gl = gradations.length;
          let paletteGradations = generatePalette(palette.colors, palette.gradations);
          let colorCount = gl / paletteGradations.length;
          let i = 0;
          gradations.sort((a, b) => a - b).forEach((color) => {
            replaceMap[color] = paletteGradations[Math.floor(i++ / colorCount)]
          });
          // console.log(replaceMap)
          for (let i = 0; i < data.length; i += 4) {
            let color = data[i] + (data[i + 1] << 8) + (data[i + 2] << 16);
            let newColor = replaceMap[color];
            data[i] = (newColor >> 16) & 0xFF;
            data[i + 1] = (newColor >> 8) & 0xFF;
            data[i + 2] = newColor & 0xFF;
          }
          resolve(image);
        }
      };
      fr.readAsDataURL(xhr.response);
    };
    xhr.send();
  });
  // let data = new Uint8ClampedArray(await response.arrayBuffer());
  // let image = new ImageData(data, 200)
  // return image;
  // return new Promise((resolve) => {
  //     // let fractalImage = ctx.getImageData(0, 0, image.width, image.height);
  //     // resolve(fractalImage);
  // });
}

export function formatDate(date) {
  date = new Date(date);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
