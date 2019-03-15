import React, { Component } from "react";

import "../../styles/Elements/Button.sass";

export default class Checkbox extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={`button-container ${this.props.className}`}>
        <button onClick={() => {
          this.props.onClick && this.props.onClick();
        }}>
          { this.props.children }
        </button>
      </div>
    )
  }
}
