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
      let user = await this.api("user/info", "GET");
      if (!user.id) {
        this.token = null;
        this.expireAt = null;
      } else {
        this.loggedAs = user;
        console.log("[FractalUniverse] logged as", this.loggedAs);
      }
    }
  },
  async login(login, password, remember, captcha) {
    console.log("[FractalUniverse] login");
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
    console.log("[FractalUniverse] logout");
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
    console.log("[FractalUniverse] getPalettes");
    return await this.api("user/palettes", "GET");
  },
  async addPalette(name, colors, gradations) {
    console.log("[FractalUniverse] addPalette");
    return await this.api("user/palettes", "POST", {
      name,
      colors,
      gradations
    });
  },
  async deletePalette(id) {
    console.log("[FractalUniverse] deletePalette");
    return await this.api("user/palettes", "DELETE", {
      id
    });
  }
}
