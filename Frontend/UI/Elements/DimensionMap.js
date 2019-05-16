import React, { Component } from "react";

import "../../styles/Elements/DimensionMap.sass"

export default function openDimensionMap(dimension) {
  window.showPopup(<Map dimension={dimension} />);
}

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDrawable: 0,
      drawables: this.props.dimension.map.drawables
    }
  }
  render() {
    console.log(this.state)
    return (
      <div className="dimension-map">
        <div className="fractal-image">
          { this.state.drawables[this.state.selectedDrawable] ? (
            this.state.drawables[this.state.selectedDrawable].state == "READY" ? (
              <img src={ this.state.drawables[this.state.selectedDrawable].url } />
            ) : (
              <div className="not-ready">
                { gettext("Image is processing.") }
              </div>
            )
          ) : null}
        </div>
        <div className="drawables">
        </div>
      </div>
    );
  }
}

    // <img src={this.props.dimension.fractal} />
