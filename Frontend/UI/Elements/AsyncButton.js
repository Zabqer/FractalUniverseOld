import React, { Component } from "react";

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
      <div className={`button-container ${this.props.className}`}>
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
          ) : this.props.children }
        </button>
      </div>
    )
  }
}
