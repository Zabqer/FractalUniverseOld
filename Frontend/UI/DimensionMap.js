import React, { Component } from "react";

import "../styles/Map.sass"

export default class Map extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log("!!",this.props.dimension.map.drawables[0])
    return (
      <div className="dimension-map">
      </div>
    );
  }
}

    // <img src={this.props.dimension.fractal} />
