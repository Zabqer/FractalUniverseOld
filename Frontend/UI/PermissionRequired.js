import React, { Component } from "react";

export default class PermissionRequired extends Component {
  constructor(props, opts) {
    super(props);
    this.isLogin = opts.isLogin;
    this.isAdmin = opts.isAdmin;
  }
  render(ignore) {
    if (!ignore) {
      if (this.isLogin == false && window.FU.loggedAs) {
        return (
          <div className="logout-required">
            { gettext("To access this page you need to logout") }
          </div>
        )
      }
      if (this.isLogin == true && !window.FU.loggedAs) {
        return (
          <div className="logout-required">
            { gettext("To access this page you need to login") }
          </div>
        )
      }
      if (this.isAdmin == true && (!window.FU.loggedAs && window.FU.loggedAs.isAdmin)) {
        return (
          <div className="login-required">
            { gettext("To access this page you need to have admin privelegies") }
          </div>
        )
      }
    }
    return this.renderWithPermissions()
  }
}

    // <img src={this.props.dimension.fractal} />
