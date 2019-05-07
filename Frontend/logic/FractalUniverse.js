const apiUrl = "http://localhost:8000/api";

export default {
  loggedAs: null,
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
  async getPalettes() {
    console.log("[FractalUniverse] getPalettes", arguments);
    return await this.api("user/palettes", "GET");
  },
  async addPalette(name, colors, gradations) {
    console.log("[FractalUniverse] addPalette", arguments);
    return await this.api("palettes", "POST", {
      name,
      colors,
      gradations
    });
  },
  async editPalette(id, name, colors, gradations) {
    console.log("[FractalUniverse] editPalette", arguments);
    return await this.api("user/palettes", "PATCH", {
      id,
      name,
      colors,
      gradations
    });
  },
  async deletePalette(id) {
    console.log("[FractalUniverse] deletePalette", arguments);
    return await this.api("user/palettes", "DELETE", {
      id
    });
  },
  async getLatestFractals() {
    console.log("[FractalUniverse] getLatestFractals", arguments);
    return await this.api("fractals/latest", "GET");
  },
  async getUniverses() {
    console.log("[FractalUniverse] getUniverses", arguments);
    return await this.api("universes", "GET");
  },
  async addUniverse(f) {
    console.log("[FractalUniverse] addUniverse", arguments);
    return await this.api("universes", "POST", {
      function: f
    });
  },
  async editUniverse(id, f) {
    console.log("[FractalUniverse] addUniverse", arguments);
    return await this.api("universes/" + id, "PUT", {
      function: f
    });
  },
  async deleteUniverse(id) {
    console.log("[FractalUniverse] deleteUniverse", arguments);
    return await this.api("universes/" + id, "DELETE");
  },
  async getDimensions(universe) {
    console.log("[FractalUniverse] getDimensions", arguments);
    return await this.api("universes/" + universe + "/dimensions", "GET");
  },
  async addDimension(universe, parameter) {
    console.log("[FractalUniverse] addDimension", arguments);
    return await this.api("universes/" + universe + "/dimensions", "POST", {
      parameter
    });
  },
  async editDimension(id, parameter) {
    console.log("[FractalUniverse] editDimension", arguments);
    return await this.api("dimensions/" + id, "PUT", {
      parameter
    });
  },
  async deleteDimension(id) {
    console.log("[FractalUniverse] deleteDimension", arguments);
    return await this.api("dimensions/" + id, "DELETE");
  },
}
