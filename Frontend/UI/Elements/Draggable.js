import React, { Component } from "react";

export default class Draggable extends Component {
  constructor(props) {
    super(props);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }
  onDragStart(element) {
    this.dragged = element;
  }
  onDragEnd(element) {
    this.dragged = null;
  }
  render() {
    return (
      <div className="draggable">
        { this.props.children.map((children, index) => {
          return (
            <div className="draggable-container" draggable onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
              { children }
            </div>
          );
        }) }
      </div>
    );
  }
}
