import React, { Component } from "react";
import { Route, Link } from "react-router-dom";

import Button from "./Elements/Button";

import LoginPopup from "./Popups/Login";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixed: false
    }
    this.header = React.createRef();
    this.onScroll = this.onScroll.bind(this);
  }
  componentDidMount() {
    window.addEventListener("scroll", this.onScroll, {
      capture: true,
      passive: true
    });
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }
  onScroll() {
    if (window.pageYOffset > 260 && !this.state.fixed) {
      this.setState({ fixed: true });
    } else if (window.pageYOffset <= 260 && this.state.fixed) {
      this.setState({ fixed: false });
    }
  }
  render() {
    return (
      <header className={`header${this.state.fixed ? " fixed" : ""}`} ref={this.header}>
        <nav>
          <Link to="/" className="active">
            Главаная
          </Link>
          <Link to="/test">
            Test
          </Link>
        </nav>
        { window.FU.loggedAs ? (
          <div style={{display: "flex"}}>
            Logged as { window.FU.loggedAs.login }
            <Button className="login-button" onClick={() => {
              window.FU.logout();
            }}>
              Выйти
            </Button>
          </div>
        ) : (
          <Button className="login-button" onClick={() => {
            window.showPopup(<LoginPopup />);
          }}>
            Вход
          </Button>) }
      </header>
    );
  }
}