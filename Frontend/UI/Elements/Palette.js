import React, { Component } from "react";

import "../../styles/Elements/Palette.sass";

import { generatePalette, decimal2hex } from "../../logic/utils";

import ColorPicker from "../Elements/ColorPicker";

function isUpdated(a1, a2, grad) {
  if (a1.length != Math.floor(a2.length / grad)) {
    return true;
  }
  return false;
}

export default class Palette extends Component {
  constructor(props) {
    super(props);
    let gradations = this.props.gradations + 1
    this.state = {
      colors: this.generateColors(this.props.colors, gradations),
      gradations,
      editing: null
    }
    this.onClick = this.onClick.bind(this);
  }
  generateColors(colors, gradations) {
    return generatePalette(colors, gradations > 50 ? 50 : gradations).map((color, index) => {
      return `#${decimal2hex(color, 6)}`
    })
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.gradations != this.props.gradations || isUpdated(nextProps.colors, this.state.colors, this.state.gradations)) {
      let gradations = nextProps.gradations + 1;
      nextState.colors = this.generateColors(nextProps.colors, gradations);
      nextState.gradations = gradations;
    }
    return true;
  }
  onClick({ target }) {
    if (this.state.editing) {
      while (target) {
        if (target.classList.contains("color-picker-container")) return;
        if (!target.parentElement) {
          this.setState({ colorPicked: null });
          return;
        }
        target = target.parentElement;
      }
    }
  }
  componentDidMount() {
    if (this.props.onChange) window.addEventListener("click", this.onClick);
  }
  componentWillUnmount() {
    if (this.props.onChange) window.removeEventListener("click", this.onClick)
  }
  render() {
    return (
      <div className="palette">
        { this.state.colors.map((color, index) => {
          let editable = this.props.onChange && index % this.state.gradations == 0;
          let realIndex = index / this.state.gradations;
          return (
            <div className={editable ? "editable" : ""} onClick={editable ? (() => {
                this.setState({ editing: realIndex });
              }) : null} key={index} style={{backgroundColor: color}}>
              { realIndex == this.state.editing ? (<ColorPicker color={this.props.colors[realIndex]} onChange={(color) => {
                // LAG FIX
                this.props.colors[realIndex] = color;
                this.setState({ colors: this.generateColors(this.props.colors, this.state.gradations) })
              }} />) : null }
            </div>
          );
        }) }
      </div>
    )
  }
}
