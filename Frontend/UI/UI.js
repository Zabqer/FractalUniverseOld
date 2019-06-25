import React, { Component } from "react";
import { Route, Link, Switch } from "react-router-dom";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import Header from "./Header";

import Parallax from "./Elements/Parallax";

import Main from "./Pages/Main";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import Admin from "./Pages/Admin";
import Dimension from "./Pages/Dimension";
import ActivateEmail from "./Pages/ActivateEmail";
import NotFound from "./Pages/NotFound";

export default class UI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popups: []
    }
  }
  componentDidMount() {
    window.forceUpdating = false;
    window.update = () => {
      console.log("[FractalUniverse] Here we go again");
      window.forceUpdating = true;
      this.forceUpdate();
      window.forceUpdating = false;
    };
    window.showPopup = popup => {
      document.body.style.overflow = "hidden";
      this.setState(state => {
        state.popups.push(popup);
        return {
          popups: state.popups
        }
      });
    };
    window.hidePopup = () => {
      if (this.state.popups.length <= 1) {
        document.body.style.overflow = "auto";
      }
      this.setState(state => {
        state.popups.pop();
        return {
          popups: state.popups
        }
      });
    };
    window.showError = message => window.showPopup(
      <div className="error-popup popup">
        <div className="header">
          { gettext("Error") }
        </div>
        <div className="content">
          { message }
        </div>
      </div>
    );
  }
  render() {
    return (
      <div className="ui">
        <div className="popuper">
        <ReactCSSTransitionGroup transitionName="popup-overlay" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
          { this.state.popups.map((popup, index) => {
            return (
              <div key={index} className="popup-overlay" onMouseDown={({ target }) => {
                if (target.classList.contains("popup-overlay")) {
                  window.hidePopup();
                }
              }}>
                { popup }
              </div>
            );
          }) }
        </ReactCSSTransitionGroup>
        </div>
        <Parallax className="background">
          <img src="/static/background.jpeg" width="100%" alt="" draggable="false" />
        </Parallax>
        <Header />
        <div className="page">
          <ReactCSSTransitionGroup transitionName="page-change" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
            <Switch>
              <Route exact path="/" component={Main} />
              {/*<LoggedInRequired isLogin={false}>*/}
              <Route path="/register" component={Register} />
              {/*</LoggedInRequired>*/}
              {/*<LoggedInRequired isLogin={true}>*/}
              <Route path="/profile" component={Profile} />
              {/*</LoggedInRequired>*/}
              <Route path="/admin" component={Admin} />
              <Route path="/dimension/:id(\d+)" component={Dimension} />
              <Route path="/activate/:user(\d+)/:hash(.+)" component={ActivateEmail} />
              <Route component={NotFound} />
            </Switch>
          </ReactCSSTransitionGroup>
        </div>
        <footer className="footer">
          Made by Zabqer with love
        </footer>
      </div>
    );
  }
}
