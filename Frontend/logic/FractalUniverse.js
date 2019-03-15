const apiUrl = "http://localhost:8000/api";

function api(endpoint, method, data) {
  async function api(endpoint, method, data) {
    return await (await fetch(`${apiUrl}/${endpoint}${method == "GET" ? "?" + new URLSearchParams(data) : ""}`, {
      headers: {
        "Accept": method != "GET" && data ? "application/json" : null,
        "Content-Type": method != "GET" && data ? "application/json" : null
      },
      body: method != "GET" && data ? JSON.stringify(data) : null,
      method
    })).json();
  }
}

export default {
  loggedAs: null,
  init() {
    console.log("[FractalUniverse] init");
    this.init = null;
  },
  async login(login, password, remember, captcha) {
    console.log("[FractalUniverse] login");
    if (this.loggedAs) {
      console.error("[FractalUniverse] arleady logged in");
      return false;
    }
    let data = await api("auth/login", "POST", {
      login,
      password,
      remember,
      captcha
    });
    console.log(data)
  }
}
