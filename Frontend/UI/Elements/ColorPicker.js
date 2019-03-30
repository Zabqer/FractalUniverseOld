import React, { Component } from "react";

import "../../styles/Elements/ColorPicker.sass";

import Button from "../Elements/Button";
import Input from "../Elements/Input";

import { rgb2hsv, hsv2rgb, decimal2hex } from "../../logic/utils";

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, width: rect.width, height: rect.height }
}

export default class ColorPicker extends Component {
  constructor(props) {
    super(props);
    let [hue, saturation, value] = rgb2hsv(parseInt(this.props.color, 16));
    let [color, hueColor] = this.calculateColors(hue, saturation, value);
    color = decimal2hex(color, 6);
    this.state = {
      hue,
      saturation,
      value,
      color: color,
      hueColor: decimal2hex(hueColor, 6),
      inputColor: "#" + color
    }
    this.onChangeCallback = this.props.onChange
  }
  calculateColors(hue, saturation, value) {
    return [hsv2rgb(hue, saturation, value), hsv2rgb(hue, 1, 1)];
  }
  upateColor(params) {
    this.setState((old) => {
      let state = Object.assign(old, params);
      let [color, hueColor] = this.calculateColors(state.hue, state.saturation, state.value);
      this.onChangeCallback(color);
      state.color = decimal2hex(color, 6);
      state.hueColor = decimal2hex(hueColor, 6);
      state.inputColor = "#" + state.color;
      return state;
    });
  }
  onPickerMove(pageX, pageY, target) {
    let rect = offset(target);
    let percentX = (pageX - rect.left) / rect.width;
    let percentY = 1 - (pageY - rect.top) / rect.height;
    this.upateColor({ saturation: percentX, value: percentY });
  }
  onThumbMove(pageX, target) {
    let rect = target.getBoundingClientRect();
    let percentX = (pageX - rect.left) / rect.width;
    this.upateColor({ hue: percentX });
  }
  //FIX RENDER TWICE!!
  render() {
    return (
      <div className="color-picker-container">
        <div className="triangle"> </div>
        <div className="picker" onClick={({ pageX, pageY, target }) => {
          this.onPickerMove(pageX, pageY, target);
        }} onMouseMove={({ buttons, pageX, pageY, target}) => {
          if (buttons == 0) return;
          this.onPickerMove(pageX, pageY, target);
        }}>
          <div className="bg-color" style={{backgroundColor: "#" + this.state.hueColor}}></div>
          <div className="bg-color-white"> </div>
          <div className="bg-color-black"> </div>
          <div className="picker-curcle" style={{left: "calc(" + this.state.saturation * 100 + "% - 10px)", top: "calc(" + (100 - this.state.value * 100) + "% - 10px)", backgroundColor: "#" + this.state.color}}> </div>
        </div>
        <div className="hue-slider" onClick={({ pageX, target }) => {
          this.onThumbMove(pageX, target);
        }} onMouseMove={({ buttons, pageX, target }) => {
          if (buttons == 0) return;
          this.onThumbMove(pageX, target);
        }}>
          <div className="thumb" style={{left: "calc(" + this.state.hue * 100 + "% - 10px)", backgroundColor: "#" + this.state.hueColor}}></div>
        </div>
        <Input placeholder="Цвет" pattern={/^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/} name="inputColor" parent={this} />
      </div>
    );
  }
}
