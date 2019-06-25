import React, { Component, Fragment } from "react";

import { Link } from "react-router-dom";
import AsyncContentProvider from "../AsyncContentProvider";
import PermissionRequired from "../PermissionRequired";

export default class ActivateEmail extends PermissionRequired {
  constructor(props) {
    super(props, {
      isLogin: false
    });
    this.state = {
      success: false
    }
    this.go = this.go.bind(this);
  }
  async go() {
    let user = this.props.match.params.user;
    let hash = this.props.match.params.hash;
    let result = await window.FU.activateEmail(user, hash);
    if (result && result.success) {
      this.setState({ success: true });
      window.update();
    } else {
      this.setState({ success: false, error: result.detail });
    }
  }
  render() {
    return super.render(this.state.success);
  }
  renderWithPermissions() {
    return (
      <div className="activate-email-page">
        <AsyncContentProvider loadCallback={this.go}>
          { this.state.success ? (
            <Fragment>
              <div>
                { gettext("You account successful activated") }
              </div>
              <Link to="/">
                { gettext("Main") }
              </Link>
            </Fragment>
          ) : (
            <Fragment>
              <div>
                { gettext("Oups.. Error occurred. Maybe link is invalid?") }
                <br/>
                { gettext("Error: ") } { this.state.error }
              </div>
            </Fragment>
          ) }
        </AsyncContentProvider>
      </div>
    )
  }
}
