import React, { Component } from "react";

export default class NotFound extends Component {
  render() {
    return (
      <div className="not-found-page">
        Oups.. The { this.props.location.pathname } url not found
      </div>
    )
  }
}
