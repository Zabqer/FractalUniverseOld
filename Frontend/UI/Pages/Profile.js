import React, { Component } from "react";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: null
    }
  }
  componentDidMount() {
    let userID = this.props.match.params.id;
    window.FU.getUserInfo(
      userID != "@me" ? userID : null
    ).then((data) => this.setState({ info: data }));
  }
  render() {
    return (
      <div className="user-profile">
        { this.state.info ? (
          <div>
            Login is { this.state.info.username } <br/>
            Email is { this.state.info.email }
          </div>
        ) : "Loading..." }
      </div>
    )
  }
}
