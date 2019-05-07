import React, { Component } from "react";

import "../../styles/Elements/Loader.sass";

export default class Loader extends Component {
  render() {
    return (
      <div className={`loader ${this.props.big ? "big" : ""}`}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    )
  }
}
