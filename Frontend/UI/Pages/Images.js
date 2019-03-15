import React, { Component } from "react";

import "../../styles/Pages/Images.sass";

export default class Images extends Component {
  render() {
    return (
      <div className="images-page">
        { Array(6).fill(0).map((_, index) => {
          return (
            <img key={index} src="/static/background.jpeg" />
          );
        }) }
      </div>
    )
  }
}
