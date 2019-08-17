import React, { Component, Fragment } from "react";
import { Route, Link } from "react-router-dom";

import Button from "./Elements/Button";
import AsyncButton from "./Elements/AsyncButton";

import LoginPopup from "./Popups/Login";
import selectPalette from "./Popups/SelectPalettePopup";

import "../styles/Header.sass";

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
          <Link to="/">
            { gettext("Main") }
          </Link>
          <Link to="/admin">
            { gettext("Admin") }
          </Link>
          <Button onClick={() => {
              selectPalette();
            }}>
            { gettext("Palette") }
          </Button>
          <div className="user-buttons">
            { window.FU.loggedAs ? (
              <Fragment>
                <Link to="/profile">
                  { window.FU.loggedAs.username }
                </Link>
                <AsyncButton onClick={() => window.FU.logout()}>
                  { gettext("Logout") }
                </AsyncButton>
              </Fragment>
            ) : (
              <Fragment>
                <Link to="/register">
                  { gettext("Register") }
                </Link>
                <Button onClick={() => {
                  window.showPopup(<LoginPopup />);
                }}>
                  { gettext("Login") }
                </Button>
              </Fragment>
            ) }
          </div>
        </nav>
      </header>
    );
  }
}
