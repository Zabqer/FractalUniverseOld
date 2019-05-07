import React, { Component } from "react";

import "../../styles/Elements/Dropdown.sass";

import ShevronIcon from "../Icons/Shevron";

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropped: false,
      selected: 0
    }
    this.container = React.createRef();
    this.onWindowClick = this.onWindowClick.bind(this);
  }
  componentDidMount() {
    window.addEventListener("click", this.onWindowClick)
  }
  componentWillUnmount() {
    window.removeEventListener("click", this.onWindowClick)
  }
  onWindowClick(event) {
    if (!this.container.current.contains(event.target)) {
      this.setState({ dropped: false })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selected !== this.state.selected) {
      this.setState({ selected: this.props.variants.findIndex((element) => element.id == nextProps.selected) || 0 });
    }
  }
  render() {
    return (
      <div className={`dropdown-container ${this.state.dropped ? "dropped" : ""} ${!this.props.variants || this.props.variants.length <= 1 ? "disabled" : ""}`} ref={this.container}>
        <div className="dropdown-header" onClick={() => {
          this.setState({
            dropped: !this.state.dropped
          })
        }}>
          <div className="placeholder">
            { this.props.placeholder }
          </div>
          <div className="element">
            { this.props.variants[this.state.selected] && this.props.variants[this.state.selected].value }
          </div>
          <div className="shevron">
            <ShevronIcon />
          </div>
        </div>
        <div className="dropdown-content">
          { this.props.variants && this.props.variants.map((element, index) => {
            return (
              <div key={element.id} className="element" onClick={() => {
                this.props.onSelect(element.id);
                this.setState({
                  dropped: false,
                  selected: index
                });
              }}>
                { element.value }
              </div>
            )
          }) }
        </div>
      </div>
    )
  }
}
