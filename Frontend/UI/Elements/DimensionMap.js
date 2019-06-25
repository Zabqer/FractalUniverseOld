import React, { Component, Fragment } from "react";

import { elementOffset } from "../../logic/utils";

import "../../styles/Elements/DimensionMap.sass";

import AsyncButton from "../Elements/AsyncButton";
import Fractal from "../Elements/Fractal";
import Input from "../Elements/Input";

export function openDimensionMap(dimension) {
  window.showPopup(<Map dimension={dimension} />);
}

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDrawable: 0,
      map: this.props.dimension.map,
      x: 0.5,
      y: 0.5
    }
    this.move = this.move.bind(this);
  }
  move(pageX, pageY, target) {
    let offset = elementOffset(target);
    let x = (pageX - offset.left) / offset.width;
    let y = (pageY - offset.top) / offset.height;
    this.setState({ x, y })
  }
  render() {
    let finished = this.state.map.state == "FINISHED";
    return (
      <div className="dimension-map">
        { finished ? (
          <Fragment>
            <div className="fractal-image">
              <Fractal fractal={this.state.map} onClick={({ pageX, pageY, target }) => {
                this.move(pageX, pageY, target);
              }} onMouseMove={({ buttons, pageX, pageY, target}) => {
                if (buttons == 0) return;
                this.move(pageX, pageY, target);
              }} />
              { this.props.onSave ? (
                <Fragment>
                  <div className="x-rail" style={{top: `${this.state.y * 100}%` }}> </div>
                  <div className="y-rail" style={{left: `${this.state.x * 100}%` }}> </div>
                </Fragment>
              ) : null }
            </div>
            { this.props.onSave ? (
              <div className="controls">
              <Input placeholder={"X"} type="number" step="0.01" name="x" min={0} max={1} parent={this} />
              <Input placeholder={"Y"} type="number" step="0.01" name="y" min={0} max={1} parent={this} />
              <AsyncButton onClick={async () => {
                try {
                  let result = await window.FU.addFractal(this.props.dimension.id, this.state.x, this.state.y);
                    window.hidePopup();
                    this.props.onSave();
                } catch (e) {
                  if (e.x) {
                    this.setState({ xError: e.x });
                  }
                  if (e.y) {
                    this.setState({ yError: e.y });
                  }
                  if (e.detail) {
                    window.showError(e.detail);
                  }
                }
              }}>
                { gettext("Add") }
              </AsyncButton>
            </div> ) : null }
          </Fragment>
        ) : (
          <div className="not-ready">
            { gettext("Image is processing.") }
          </div>
        ) }
      </div>
    );
  }
}

    // <img src={this.props.dimension.fractal} />
