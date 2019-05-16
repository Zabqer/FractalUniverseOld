const apiUrl = "http://localhost:8000/api";

let cache = {
  users: {},
  universes: {},
  dimensions: {}
}

console.log(cache)

export default {
  loggedAs: null,
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
    setDimension(dimension) {
      cache.dimensions[dimension.id] = dimension;
      if (cache.universes[dimension.universe]) {
        cache.universes[dimension.universe].dimensions[dimension.id] = dimension;
        dimension.universe = cache.universes[dimension.universe];
      }
    },
    deleteDimension(id) {
      delete cache.dimensions[id];
    }
  },
  async api(endpoint, method, data) {
    let result = await (await fetch(`${apiUrl}/${endpoint}${method == "GET" && data && ("?" + new URLSearchParams(data)) || ""}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": this.token ? "Token " + this.token : undefined,
        "Content-Type": method != "GET" && data ? "application/json" : undefined
      },
      body: method != "GET" && data ? JSON.stringify(data) : undefined,
      method
    })).json();
    // Обновляем время сброса токена
    if (result.expire_at) {
      this.expire_at = result.expire_at;
      localStorage.setItem("expire_at", this.expireAt);
    }
    return result;
  },
  async init() {
    console.log("[FractalUniverse] init");
    this.init = null;
    this.token = localStorage.getItem("token");
    this.expireAt = localStorage.getItem("expire_at");
    // Проверяем не истёк ли токен
    if (new Date(this.expireAt) <= new Date()) {
      console.warn("[FractalUniverse] token has expired")
      this.token = null;
      this.expireAt = null;
      this.loggedAs = null;
      localStorage.removeItem("token");
      localStorage.removeItem("expire_at");
    }
    // Получаем информацию о пользователе
    if (this.token) {
      let user = await this.api("users", "GET");
      if (!user.id) {
        this.token = null;
        this.expireAt = null;
        localStorage.removeItem("token");
        localStorage.removeItem("expire_at");
      } else {
        this.loggedAs = user;
        console.log("[FractalUniverse] logged as", this.loggedAs);
      }
    }
  },
  async login(login, password, remember, captcha) {
    console.log("[FractalUniverse] login", arguments);
    if (this.loggedAs) {
      console.error("[FractalUniverse] arleady logged in");
      return false;
    }
    let data = await this.api("auth/login", "POST", {
      login,
      password,
      remember,
      captcha
    });
    if (data.token) {
      this.token = data.token;
      this.loggedAs = data.user;
      console.log("[FractalUniverse] logged as", this.loggedAs);
      localStorage.setItem("token", this.token);
      return true;
    }
    return data;
  },
  async logout() {
    console.log("[FractalUniverse] logout", arguments);
    if (!this.loggedAs) {
      console.error("[FractalUniverse] not logged in");
      return false;
    }
    await this.api("auth/logout", "POST");
    this.token = null;
    this.expireAt = null;
    this.loggedAs = null;
    localStorage.removeItem("token");
    localStorage.removeItem("expire_at");
    return true;
  },
  // USER
  async searchUsers(keywords, page) {
    console.log("[FractalUniverse] searchUsers", arguments);
    let result = await this.api("users/search", "POST", {
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
    let result = await this.api("universes", "POST", {
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
    let result = await this.api("universes/search", "POST", {
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
    let result = await this.api(`universes/${id}`, "DELETE");
    if (result && result.success) {
      this.cache.deleteUniverse(id);
    }
    return result;
  },
  // UNIVERSE
  // DIMENSION
  async addDimension(universe, name, parameter) {
    console.log("[FractalUniverse] addDimension", arguments);
    let result = await this.api(`universes/${universe}/dimensions`, "POST", {
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
    let result = await this.api(`universes/${universe}/dimensions/search`, "POST", {
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
    let result = await this.api(`dimensions/${id}`, "DELETE");
    if (result && result.success) {
      this.cache.deleteDimension(id);
    }
    return result;
  },
  // DIMENSION
  // PALETTE
  async addPalette(name, colors, gradations) {
    console.log("[FractalUniverse] addPalette", arguments);
    return await this.api("palettes", "POST", {
      name,
      colors,
      gradations
    });
  },
  async searchPalettes(keywords, page) {
    console.log("[FractalUniverse] searchPalettes", arguments);
    return await this.api("palettes/search", "POST", {
      keywords,
      page
    });
  },
  async deletePalette(id) {
    console.log("[FractalUniverse] deletePalette", arguments);
    let result = await this.api(`palettes/${id}`, "DELETE");
    return result;
  },
  // PALETTE
  // TASK
  async searchTasks(keywords, page) {
    console.log("[FractalUniverse] searchTasks", arguments);
    return await this.api("tasks/search", "POST", {
      keywords,
      page
    });
  },
  // TASK
  // async getPalettes() {
  //   console.log("[FractalUniverse] getPalettes", arguments);
  //   return await this.api("user/palettes", "GET");
  // },
  // async addPalette(name, colors, gradations) {
  //   console.log("[FractalUniverse] addPalette", arguments);
  //   return await this.api("palettes", "POST", {
  //     name,
  //     colors,
  //     gradations
  //   });
  // },
  // async editPalette(id, name, colors, gradations) {
  //   console.log("[FractalUniverse] editPalette", arguments);
  //   return await this.api("user/palettes", "PATCH", {
  //     id,
  //     name,
  //     colors,
  //     gradations
  //   });
  // },
  // async deletePalette(id) {
  //   console.log("[FractalUniverse] deletePalette", arguments);
  //   return await this.api("user/palettes", "DELETE", {
  //     id
  //   });
  // },
  // async getLatestFractals() {
  //   console.log("[FractalUniverse] getLatestFractals", arguments);
  //   return await this.api("fractals/latest", "GET");
  // },
  // async getUniverses() {
  //   console.log("[FractalUniverse] getUniverses", arguments);
  //   return await this.api("universes", "GET");
  // },
  // async addUniverse(f) {
  //   console.log("[FractalUniverse] addUniverse", arguments);
  //   return await this.api("universes", "POST", {
  //     function: f
  //   });
  // },
  // async editUniverse(id, f) {
  //   console.log("[FractalUniverse] addUniverse", arguments);
  //   return await this.api("universes/" + id, "PUT", {
  //     function: f
  //   });
  // },
  // async getDimensions(universe) {
  //   console.log("[FractalUniverse] getDimensions", arguments);
  //   return await this.api("universes/" + universe + "/dimensions", "GET");
  // },
  // async addDimension(universe, parameter) {
  //   console.log("[FractalUniverse] addDimension", arguments);
  //   return await this.api("universes/" + universe + "/dimensions", "POST", {
  //     parameter
  //   });
  // },
  // async editDimension(id, parameter) {
  //   console.log("[FractalUniverse] editDimension", arguments);
  //   return await this.api("dimensions/" + id, "PUT", {
  //     parameter
  //   });
  // },
  // async deleteDimension(id) {
  //   console.log("[FractalUniverse] deleteDimension", arguments);
  //   return await this.api("dimensions/" + id, "DELETE");
  // },
}
