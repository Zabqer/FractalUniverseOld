import React, { Component } from "react";

export default class LoggedInRequired extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (!window.FU.loggedAs) {
      return (
        <div className="login-required">
          To access this page you need to login in
        </div>
      )
    }
    if (this.props.isAdmin && (!window.FU.loggedAs && window.FU.loggedAs.isAdmin)) {
      return (
        <div className="login-required">
          To access this page you need to have admin privelegies
        </div>
      )
    }
    return this.props.children;
  }
}

    // <img src={this.props.dimension.fractal} />
