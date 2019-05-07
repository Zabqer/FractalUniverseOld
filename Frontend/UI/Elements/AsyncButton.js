import React, { Component, Fragment } from "react";

import "../../styles/Elements/Button.sass";
import "../../styles/Elements/AsyncButton.sass";

export default class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExecuting: false
    }
  }
  render() {
    return (
      <div className={`button-container ${this.props.className && this.props.className} ${this.props.withIcon && "withIcon"} ${this.props.disabled ? "disabled" : ""}`}>
        <button onClick={() => {
          if (this.state.isExecuting) return true;
          this.setState({ isExecuting: true });
          this.props.onClick().then(() => {
            this.setState({ isExecuting: false });
            window.update();
          });
        }} disabled={this.state.isExecuting}>
          { this.state.isExecuting ? (
            <div className="async-button-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <Fragment>
              { this.props.children }
              { this.props.withIcon && <this.props.withIcon/ > }
            </Fragment>
          ) }
        </button>
      </div>
    )
  }
}
