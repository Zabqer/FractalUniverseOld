import React, { Component } from "react";

import AsyncButton from "../Elements/AsyncButton";

import "../../styles/Pages/Images.sass";

export default class Images extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestFractals: null
    }
  }
  async componentDidMount() {
    let result = await window.FU.getLatestFractals();
    this.setState({ latestFractals: result });
  }
  render() {
    return (
      <div className="images-page">
        <h2>
          { gettext("Latest") }
        </h2>
        <div className="images">
          { this.state.latestFractals ? this.state.latestFractals.map((fractal, index) => {
            return (
              <img key={index} src={fractal.imageUrl} />
            );
          }) : null }
        </div>
      </div>
    )
  }
}
