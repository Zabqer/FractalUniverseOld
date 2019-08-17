import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import Loader from "./Elements/Loader";

import "../styles/AsyncContentProvider.sass";

export default class AsyncContentProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      index: this.props.index
    }
  }
  componentDidMount() {
    this.props.loadCallback().then(() => {
      this.setState({ loaded: true });
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.index !== this.state.index) {
      this.setState({ loaded: false, index: nextProps.index });
      this.props.loadCallback().then(() => {
        this.setState({ loaded: true });
      })
    }
  }
  render() {
    return (
      <div className="loadable">
        <ReactCSSTransitionGroup transitionName="loadable" transitionEnterTimeout={300} transitionLeaveTimeout={150}>
          { !this.state.loaded ? <Loader big={true}/> : null }
          { this.state.loaded ? <div className={this.props.className}> { this.props.children } </div> : null }
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
