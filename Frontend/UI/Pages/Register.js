import React, { Component, Fragment } from "react";

import Input from "../Elements/Input";
import Button from "../Elements/Button";


import Recaptcha from "react-recaptcha";

import "../../styles/Pages/Register.sass";

import ReactCSSTransitionGroup from "react-addons-css-transition-group";

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: "form",
      login: "",
      loginError: null,
      email: "",
      emailError: null,
      password: "",
      passwordError: null
    }
  }
  render() {
    return (
      <div className="register-page">
        <h2> { gettext("Registration") } </h2>
        <div className="column">
          <ReactCSSTransitionGroup transitionName="authorize-change" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
            { this.state.stage == "form" || this.state.stage == "captcha" ? (
              <Fragment>
                <Input name="login" type="login" placeholder={gettext("Username")} parent={this} />
                <Input name="email" type="email" placeholder={gettext("Email")} parent={this} />
                <Input name="password" type="password" placeholder={gettext("Password")} parent={this} />
                <Button onClick={(event) => {
                  event.preventDefault();
                  this.setState({ stage: "captcha" });
                }}> { gettext("Go") } </Button>
              </Fragment>
            ) : null }
            { this.state.stage == "captcha" ? (
              <div className="google-captcha">
                <Recaptcha
                  sitekey="6Ld_dZYUAAAAADYclvtGmWVBCZmNFr0sLLLgs61m"
                  render="explicit"
                  verifyCallback={async (captcha) => {
                    let result = await window.FU.register(this.state.login, this.state.email, this.state.password, captcha);
                    if (result && result.success) {
                      this.setState({ stage: "email" });
                    } else {
                      if (result.login) {
                        this.setState({ loginError: result.login });
                      }
                      if (result.email) {
                        this.setState({ loginError: result.email });
                      }
                      if (result.password) {
                        this.setState({ passwordError: result.password });
                      }
                      this.setState({ stage: "form" });
                    }
                  }}
                />
              </div>
            ) : null }
            { this.state.stage == "email" ? (
              <div className="registered">
                { gettext("You're succesful registered. Check you inbox.") }
              </div>
            ) : null }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    )
  }
}
