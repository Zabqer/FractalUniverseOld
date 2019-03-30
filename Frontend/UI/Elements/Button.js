import React, { Component } from "react";

import "../../styles/Elements/Button.sass";

export default class Button extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={`button-container ${this.props.classNam && this.props.className} ${this.props.withIcon && "withIcon"}`}>
        <button onClick={(event) => {
          this.props.onClick && this.props.onClick(event);
        }}>
          { this.props.withIcon && <this.props.withIcon/ > }
          { this.props.children }
        </button>
      </div>
    )
  }
}
