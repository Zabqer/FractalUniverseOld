import React, { Component, Fragment } from "react";

import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import Recaptcha from "react-recaptcha";

import Button from "../Elements/Button";
import Input from "../Elements/Input";
import Checkbox from "../Elements/Checkbox";

import GoogleIcon from "../Icons/Google";
import FacebookIcon from "../Icons/Facebook";
import TwitterIcon from "../Icons/Twitter";
import VKontakteIcon from "../Icons/VKontakte";

import "../../styles/Popups/Login.sass";

export default class LoginPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: "form",
      login: "",
      loginError: null,
      password: "",
      passwordError: null,
      rememberMe: false
    }
  }
  render() {
    return (
      <div className="popup authorize">
        <div className="header">
          Вход
        </div>
          <div>
            <form className="login-form">
              <Input placeholder="Логин" type="text" name="login" autoComplete="login" parent={this} />
              <Input placeholder="Пароль" type="password" name="password" autoComplete="password" parent={this} />
              <Checkbox label="Запомнить меня" name="rememberMe" parent={this} />
              <Button onClick={(event) => {
                event.preventDefault();
                this.setState({ stage: "captcha" });
              }}>
                Войти
              </Button>
            </form>
            <div className="login-alternatives">
              <span className="text"> Или войти через </span>
              <div className="icons">
                <div className="google">
                  <GoogleIcon />
                </div>
                <div className="facebook">
                  <FacebookIcon />
                </div>
                <div className="twitter">
                  <TwitterIcon />
                </div>
                <div className="vkontakte">
                  <VKontakteIcon />
                </div>
              </div>
            </div>
          </div>
          <ReactCSSTransitionGroup transitionName="authorize-change" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
            { this.state.stage == "captcha" ? (
              <div className="google-captcha">
                <Recaptcha
                  sitekey="6Ld_dZYUAAAAADYclvtGmWVBCZmNFr0sLLLgs61m"
                  render="explicit"
                  verifyCallback={async (captcha) => {
                    try {
                      await window.FU.login(this.state.login, this.state.password, this.state.rememberMe, captcha);
                      window.hidePopup();
                    } catch (e) {
                      console.log(e)
                      if (e.login) {
                        this.setState({ loginError: e.login });
                      }
                      if (e.password) {
                        this.setState({ passwordError: e.password });
                      }
                      if (e.detail) {
                        window.showError(e.detail);
                      }
                      this.setState({ stage: "form" });
                    }
                  }}
                />
              </div>
            ) : null }
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
