import React, { Component } from "react";

import "../../styles/Elements/Palette.sass";

import { generatePalette, decimal2hex } from "../../logic/utils";

function isEqualArrays(a1, a2) {
  console.log("isEqualArrays", a1, a2)
  if (a1.length != a2.length) {
    return false;
  }
  return true;
}

export default class Palette extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: this.generateColors(this.props.colors, this.props.gradations + 1)
    }
  }
  generateColors(colors, gradations) {
    console.log("generateColors", colors, gradations)
    return generatePalette(colors, gradations > 50 ? 50 : gradations).map((color, index) => {
      return `#${decimal2hex(color, 6)}`
    })
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log(this.props)
    console.log(nextProps)
    if (nextProps.gradations != this.props.gradations) {
      nextState.colors = this.generateColors(nextProps.colors, nextProps.gradations + 1);
    }
    return true;
  }
  render() {
    return (
      <div className="palette">
        { this.state.colors.map((color, index) => {
          return (
            <div key={index} style={{backgroundColor: color}}> </div>
          );
        }) }
      </div>
    )
  }
}
