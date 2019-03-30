import React, { Component } from "react";

import generateId from "../../logic/unique-id";

import "../../styles/Elements/Input.sass";

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.id = generateId("input");
  }
  render() {
    return (
      <div className="input-container">
        <input id={this.id} pattern={this.props.pattern} name={this.props.name} type={this.props.type} autoComplete={this.props.autoComplete} placeholder=" " value={this.props.parent.state[this.props.name]} min={this.props.min} onChange={({ target }) => {
          this.props.parent.setState({
            [this.props.name]: target.value,
            [this.props.name + "Error"]: null
          });
          this.props.onChange && this.props.onChange(target.value);
        }} />
        <label htmlFor={this.id}> { this.props.placeholder } </label>
        <div className="line"></div>
        <div className="error"> { this.props.parent.state[this.props.name + "Error"] } </div>
      </div>
    )
  }
}
