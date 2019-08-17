import React, { Component, Fragment } from "react";

//import "../../styles/Elements/DimensionMap.sass";

export default class Fractal extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }
  async componentDidMount() {
    let canvas = this.canvas.current;
    let ctx = canvas.getContext("2d");
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
    let img = await window.FU.getPaletteImage(this.props.fractal.id);
    let c = document.createElement("canvas");
    c.width = img.width
    c.height = img.height
    c.getContext("2d").putImageData(img, 0, 0);
    ctx.scale(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(c, 0, 0);
    ctx.restore();
  }
  render() {
    if (window.forceUpdating) {
      this.componentDidMount();
    }
    return (
      <canvas width="400" height="400" ref={this.canvas} onClick={this.props.onClick} onMouseMove={this.props.onMouseMove}>
      </canvas>
    )
  }
}
