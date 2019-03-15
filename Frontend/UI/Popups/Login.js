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
      password: "",
      loginError: null,
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
            <div className="login-form">
              <Input placeholder="Логин" type="email" name="login" autoComplete="email" parent={this} />
              <Input placeholder="Пароль" type="password" name="password" autoComplete="password" parent={this} />
              <Checkbox label="Запомнить меня" name="rememberMe" parent={this} />
              <Button onClick={() => {
                this.setState({ stage: "captcha" });
              }} onClick={async () => {
                console.log(await window.FU.login(this.state.login, this.state.password, this.state.rememberMe, null));
              }}>
                Войти
              </Button>
            </div>
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
                    let result = await window.FU.login(this.state.login, this.state.password, this.state.rememberMe, captcha);
                    if (result === true) {
                      window.hidePopup();
                    } else {
                      if (result === "WRONG_LOGIN") {
                        this.setState({ loginError: "Такой аккаунт не зарегистрирован", stage: "form" });
                      } else if (result === "WRONG_PASSWORD") {
                        this.setState({ passwordError: "Неправильный пароль", stage: "form" });
                      } else {
                        this.setState({ stage: "form" });
                        console.error("Login error", result);
                      }
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
