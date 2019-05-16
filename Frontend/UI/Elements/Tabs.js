import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import "../../styles/Elements/Tabs.sass";

export class Tab extends Component {}

export class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0
    }
  }
  render() {
    return (
      <div className="tabs-container">
        <div className="tabs">
          { this.props.children.map((element, index) => {
            return (
              <div key={index} className={`tab ${index == this.state.active ? "active" : ""}`} onClick={() => {
                this.setState({ active: index })
              }}>
                { element.props.title }
              </div>
            )
          }) }
        </div>
        <div className="tab-content">
          <ReactCSSTransitionGroup transitionName="tab-change" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
            { this.props.children.map((element, index) => {
              if (index == this.state.active) {
                return (
                  <div key={index} className="tab">
                    { element.props.children }
                  </div>
                )
              }
            }) }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    )
  }
}
