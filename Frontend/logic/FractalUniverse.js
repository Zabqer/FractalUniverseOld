const apiUrl = `${window.location.origin}/api`;

import { generateImage } from "./utils";

let cache = {
  users: {},
  universes: {},
  dimensions: {},
  fractals: {},
  palettes: {},
  images: {}
}
window.debug_cache = cache
console.log(window.debug_cache)

export default {
  loggedAs: null,
  palette: null,
  cache: {
    setUser(user) {
      cache.users[user.id] = user;
    },
    deleteUser(id) {
      delete cache.users[id];
    },
    setUniverse(universe) {
      cache.universes[universe.id] = Object.assign(universe, {
        dimensions: {}
      });
    },
    deleteUniverse(id) {
      delete cache.universes[id];
    },
    getDimension(id) {
      return cache.dimensions[id];
    },
    setDimension(dimension) {
      cache.dimensions[dimension.id] = dimension;
      if (cache.universes[dimension.universe]) {
        cache.universes[dimension.universe].dimensions[dimension.id] = dimension;
        dimension.universe = cache.universes[dimension.universe];
      }
      this.setFractal(dimension.map)
    },
    deleteDimension(id) {
      delete cache.dimensions[id];
    },
    getFractal(id) {
      return cache.fractals[id];
    },
    setFractal(fractal) {
      cache.fractals[fractal.id] = fractal;
    },
    getPalette(id) {
      return cache.palettes[id];
    },
    setPalette(palette) {
      cache.palettes[palette.id] = palette;
    },
    getPaletteImage(id) {
      return cache.images[id];
    },
    setPaletteImage(id, image) {
      cache.images[id] = image;
    },
    clearImageCache() {
      console.log("[FractalUniverse.cache] clearImageCache");
      cache.images = {};
      window.update();
    }
  },
  async api(endpoint, method, data) {
    let response = await fetch(`${apiUrl}/${endpoint}${method == "GET" && data && ("?" + new URLSearchParams(data)) || ""}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": this.token ? `Token ${this.token}` : undefined,
        "Content-Type": method != "GET" && data ? "application/json" : undefined
      },
      body: method != "GET" && data ? JSON.stringify(data) : undefined,
      method
    });
    if (response.status == 204) return true;
    let result = await response.json();
    if (response.status != 200) {
      console.error(Object.values(result)[0]);
      throw Object.assign(result, { status: response.status })
    }
    // Обновляем время сброса токена
    if (result.expire_at) {
      this.expireAt = result.expire_at;
      localStorage.setItem("expire_at", this.expireAt);
    }
    return result;
  },
  async init() {
    console.log("[FractalUniverse] init");
    this.init = null;
    this.token = localStorage.getItem("token");
    this.expireAt = localStorage.getItem("expire_at");
    if (this.expireAt) {
      // Проверяем не истёк ли токен
      if (new Date(this.expireAt) <= new Date()) {
        console.warn("[FractalUniverse] token has expired")
        this.token = null;
        this.expireAt = null;
        this.loggedAs = null;
        localStorage.removeItem("token");
        localStorage.removeItem("expire_at");
        return;
      }
    }
    // Получаем информацию о пользователе
    if (this.token) {
      try {
        let user = await this.api("user", "GET");
        if (!user.id) {
          this.token = null;
          this.expireAt = null;
          localStorage.removeItem("token");
          localStorage.removeItem("expire_at");
        } else {
          this.loggedAs = user;
          console.log("[FractalUniverse] logged as", this.loggedAs);
        }
        let paletteId = localStorage.getItem("palette");
        if (paletteId == null) {
          this.palette = await this.getDefaultPalette();
          localStorage.setItem("palette", this.palette.id)
        } else {
          try {
            this.palette= await this.getPalette(paletteId);
          } catch (e) {
            if (e.status == 404) {
              this.palette = await this.getDefaultPalette();
              localStorage.setItem("palette", this.palette.id)
            }
          }
        }
      } catch (e) {
        if (e.status == 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("expire_at");
          this.token = null;
          this.expireAt = null;
        }
      }
    }
  },
  async login(login, password, remember, captcha) {
    console.log("[FractalUniverse] login", arguments);
    if (this.loggedAs) {
      console.error("[FractalUniverse] arleady logged in");
      return false;
    }
    let response = await this.api("session", "POST", {
      login,
      password,
      remember,
      captcha
    });
    this.token = response.token;
    this.loggedAs = response.user;
    console.log("[FractalUniverse] logged as", this.loggedAs);
    localStorage.setItem("token", this.token);
    return true;
  },
  async register(login, email, password, captcha) {
    console.log("[FractalUniverse] register", arguments);
    if (this.loggedAs) {
      console.error("[FractalUniverse] arleady logged in");
      return false;
    }
    let data = await this.api("user", "POST", {
      login,
      email,
      password,
      captcha
    });
    return data;
  },
  async activateEmail(user, hash) {
    console.log("[FractalUniverse] activateEmail", arguments);
    if (this.loggedAs) {
      console.error("[FractalUniverse] arleady logged in");
      return false;
    }
    let data = await this.api("user/activate", "POST", {
      user,
      hash
    });
    if (data.token) {
      this.token = data.token;
      this.loggedAs = data.user;
      console.log("[FractalUniverse] logged as", this.loggedAs);
      localStorage.setItem("token", this.token);
    }
    return data;
  },
  async logout() {
    console.log("[FractalUniverse] logout", arguments);
    if (!this.loggedAs) {
      console.error("[FractalUniverse] not logged in");
      return false;
    }
    await this.api("session", "DELETE");
    this.token = null;
    this.expireAt = null;
    this.loggedAs = null;
    localStorage.removeItem("token");
    localStorage.removeItem("expire_at");
    return true;
  },
  async setPalette(id) {
    console.log("[FractalUniverse] setPalette", arguments);
    let palette = await this.getPalette(id);
    if (!palette) {
      return palette.detail;
    }
    this.palette = palette;
    localStorage.setItem("palette", palette.id);
    this.cache.clearImageCache();
    return true;
  },
  // USER
  async searchUsers(keywords, page) {
    console.log("[FractalUniverse] searchUsers", arguments);
    let result = await this.api("user/search", "POST", {
      keywords,
      page
    });
    if (result && result.users) {
      result.users.forEach((user) => {
        this.cache.setUser(user);
      });
    }
    return result;
  },
  // USER
  // UNIVERSE
  async addUniverse(name, f) {
    console.log("[FractalUniverse] addUniverse", arguments);
    let result = await this.api("universe", "POST", {
      name,
      function: f
    });
    if (result.success) {
      this.cache.setUniverse(result.universe);
    }
    return result;
  },
  async searchUniverses(keywords, page) {
    console.log("[FractalUniverse] searchUniverses", arguments);
    let result = await this.api("universe/search", "POST", {
      keywords,
      page
    });
    if (result && result.universes) {
      result.universes.forEach((universe) => {
        this.cache.setUniverse(universe);
      });
    }
    return result;
  },
  async deleteUniverse(id) {
    console.log("[FractalUniverse] deleteUniverse", arguments);
    let result = await this.api(`universe/${id}`, "DELETE");
    if (result && result.success) {
      this.cache.deleteUniverse(id);
    }
    return result;
  },
  // UNIVERSE
  // DIMENSION
  async getDimension(id) {
    console.log("[FractalUniverse] getDimension", arguments);
    let cached = this.cache.getDimension(id);
    if (cached) {
      return cached;
    }
    let result = await this.api(`dimension/${id}`, "GET");
    if (result && result.id) {
      this.cache.setDimension(result);
    }
    return result;
  },
  async addDimension(universe, name, parameter) {
    console.log("[FractalUniverse] addDimension", arguments);
    let result = await this.api(`universe/${universe}/dimension`, "POST", {
      name,
      parameter
    });
    if (result.success) {
      this.cache.setDimension(result.dimension);
    }
    return result;
  },
  async searchDimensions(universe, keywords, page) {
    console.log("[FractalUniverse] searchDimensions", arguments);
    let result = await this.api(`universe/${universe}/dimension/search`, "POST", {
      keywords,
      page
    });
    if (result && result.dimensions) {
      result.dimensions.forEach((dimension) => {
        this.cache.setDimension(dimension);
      });
    }
    return result;
  },
  async searchAllDimensions(keywords, page) {
    console.log("[FractalUniverse] searchAllDimensions", arguments);
    let result = await this.api(`dimension/search`, "POST", {
      keywords,
      page
    });
    if (result && result.dimensions) {
      result.dimensions.forEach((dimension) => {
        this.cache.setDimension(dimension);
      });
    }
    return result;
  },
  async deleteDimension(id) {
    console.log("[FractalUniverse] deleteDimension", arguments);
    let result = await this.api(`dimension/${id}`, "DELETE");
    if (result && result.success) {
      this.cache.deleteDimension(id);
    }
    return result;
  },
  // DIMENSION
  // FRACTAL
  async getFractal(id) {
    console.log("[FractalUniverse] getFractal", arguments);
    let cached = this.cache.getFractal(id);
    if (cached) {
      return cached;
    }
    let result = await this.api(`fractal/${id}`, "GET");
    if (result && result.id) {
      this.cache.setFractal(result);
    }
    return result;
  },
  async searchFractals(id, keywords, page) {
    console.log("[FractalUniverse] searchFractals", arguments);
    let result = await this.api(`dimension/${id}/fractal/search`, "POST", {
      keywords,
      page
    });
    if (result && result.fractals) {
      result.fractals.forEach((dimension) => {
        this.cache.setFractal(dimension);
      });
    }
    return result;
  },
  async addFractal(dimension, x, y) {
    console.log("[FractalUniverse] addFrtactal", arguments);
    return await this.api(`dimension/${dimension}/fractal`, "POST", {
      x,
      y
    });
  },
  async getPaletteImage(id) {
    console.log("[FractalUniverse] getFractalImage", arguments);
    let cached = this.cache.getPaletteImage(id);
    if (cached) {
      return cached;
    }
    let fractal = await this.getFractal(id);
    let image = await generateImage(fractal.url, this.palette)
    this.cache.setPaletteImage(id, image);
    return image;
  },
  // FRACTAL
  // PALETTE
  async getDefaultPalette() {
    console.log("[FractalUniverse] getDefaultPalette", arguments);
    return await this.api("palette/default", "GET");
  },
  async getPalette(id) {
    console.log("[FractalUniverse] getPalette", arguments);
    let cached = this.cache.getPalette(id);
    if (cached) {
      return cached;
    }
    let result = await this.api(`palette/${id}`, "GET");
    if (result && result.id) {
      this.cache.setPalette(result);
    }
    return result;
  },
  async addPalette(name, colors, gradations, global) {
    console.log("[FractalUniverse] addPalette", arguments);
    return await this.api("palette", "POST", {
      name,
      colors,
      gradations,
      glob: global
    });
  },
  async searchPalettes(keywords, page, isUser) {
    console.log("[FractalUniverse] searchPalettes", arguments);
    let result = await this.api(isUser ? "user/palette/search" : "palette/search", "POST", {
      keywords,
      page
    });
    if (result && result.palettes) {
      result.palettes.forEach((palette) => {
        this.cache.setPalette(palette);
      });
    }
    return result;
  },
  async deletePalette(id) {
    console.log("[FractalUniverse] deletePalette", arguments);
    let result = await this.api(`palette/${id}`, "DELETE");
    return result;
  },
  // PALETTE
  // TASK
  async searchTasks(keywords, page, isUser) {
    console.log("[FractalUniverse] searchTasks", arguments);
    return await this.api(isUser ? "user/task/search" : "task/search", "POST", {
      keywords,
      page
    });
  },
  // TASK
}
