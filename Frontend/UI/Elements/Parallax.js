import React, { Component } from "react";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
    this.onScroll = this.onScroll.bind(this);
  }
  componentDidMount() {
    window.addEventListener("scroll", this.onScroll, {
      capture: true,
      passive: true
    });
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }
  onScroll() {
    this.container.current.style.transform = "translate3d(0, " + (window.pageYOffset / 2 ) + "px, 0)";
  }
  render() {
    return (
      <div className={"parallax " + this.props.className} ref={this.container}>
        { this.props.children }
      </div>
    );
  }
}
