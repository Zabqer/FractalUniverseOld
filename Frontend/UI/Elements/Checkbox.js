import React, { Component } from "react";

import generateId from "../../logic/unique-id";

import "../../styles/Elements/Checkbox.sass";

export default class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.id = generateId("checkbox");
  }
  render() {
    return (
      <div className="checkbox-container">
        <input id={this.id} type="checkbox" value={this.props.parent.state[this.props.name]} onChange={({ target }) => {
          this.props.parent.setState({
            [this.props.name]: target.checked,
          });
        }} />
        <label className="checkbox" htmlFor={this.id}></label>
        <label className="label" htmlFor={this.id}> { this.props.label } </label>
      </div>
    )
  }
}
