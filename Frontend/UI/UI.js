import React, { Component } from "react";
import { Route, Link, Switch } from "react-router-dom";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import Header from "./Header";

import Parallax from "./Elements/Parallax";

import Images from "./Pages/Images";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/NotFound";

export default class UI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popups: []
    }
  }
  componentDidMount() {
    window.update = () => this.forceUpdate();
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
          <img src="/static/background.jpeg" width="100%" alt="" />
        </Parallax>
        <Header />
        <div className="page">
          <ReactCSSTransitionGroup transitionName="page-change" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
            <Switch>
              <Route exact path="/" component={Images} />
              <Route path="/profile" component={Profile} />
              <Route path="/profile/:id" component={Profile} />
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
