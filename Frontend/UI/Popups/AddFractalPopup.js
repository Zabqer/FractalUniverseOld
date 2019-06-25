import React, { Component, Fragment } from "react";

import DimensionMap from "../Elements/DimensionMap";

export default class AddFractalPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  render() {
    return (
      <div className="popup add-fractal-popup">
        <div className="header">
          { gettext("Add fractal") }
        </div>
        <DimensionMap dimension={this.props.dimension} onSave={console.log} />
      </div>
    )
  }
}
