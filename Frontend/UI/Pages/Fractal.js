import React, { Component, Fragment } from "react";

import FractalView from "../Elements/Fractal";

import Button from "../Elements/Button";

import AsyncContentProvider from "../AsyncContentProvider";

import "../../styles/Pages/Fractal.sass";

import LikeIcon from "../Icons/Like";
import DislikeIcon from "../Icons/Dislike";
import HeartIcon from "../Icons/Heart";

import Paginator from "../Elements/Paginator";

class FractalStatistic extends Component {
  render() {
    let ld = (this.props.statistic.likes + this.props.statistic.dislikes) / 100;
    return (
      <div className="fractal-statistic">
        <div className="likes-dislikes">
          <div className="meters">
            <div className="likes">
              <Button withIcon={LikeIcon} className="active">
                { this.props.statistic.likes }
              </Button>
            </div>
            <div className="dislikes">
              <Button withIcon={DislikeIcon}>
                { this.props.statistic.dislikes }
              </Button>
            </div>
          </div>
          <div className="bar">
            <div className="likes" style={{width: `${this.props.statistic.likes / ld}%`}}></div>
            <div className="dislikes" style={{width: `${this.props.statistic.dislikes / ld}%`}}></div>
          </div>
        </div>
        <div className="favorites">
          <Button withIcon={HeartIcon} className="active">
            { this.props.statistic.favorites }
          </Button>
        </div>
      </div>
    )
  }
}

function localizeTimedelta(seconds) {
  let str = "";
  let date = new Date(seconds * 1000);
  console.log(date.toUTCString())
  if (date.getUTCFullYear() - 1970 > 0) {
    str += `${date.getUTCFullYear() - 1970} ${gettext("years")}`;
  } else if (date.getUTCMonth() > 0) {
    str += `${date.getUTCMonth() + 1} ${gettext("months")}`;
  } else if (date.getUTCDate() > 1) {
    str += `${date.getUTCDate() - 1} ${gettext("days")}`;
  } else if (date.getUTCHours() > 0) {
    str += `${date.getUTCHours()} ${gettext("hours")}`;
  } else if (date.getUTCMinutes() > 0) {
    str += `${date.getUTCMinutes()} ${gettext("minutes")}`;
  } else {
    str += `${date.getUTCSeconds()} ${gettext("seconds")}`;
  }
  return `${str} ${gettext("ago")}`;
}

class UserComment extends Component {
  render() {
    this.props.comment.user.avatar = "https://cdn.discordapp.com/avatars/208864724056539137/e17ed72d7f57afe03825e42a444d3bcc.png?size=128";
    const { comment } = this.props;
    return (
      <div className="comment">
        <img className="avatar" src={comment.user.avatar} />
        <div className="wrapper">
          <div className="header-wrapper">
            <div className="username">
              { comment.user.username }
            </div>
            <div className="date">
              { localizeTimedelta((new Date().getTime() / 1000) - comment.date)}
            </div>
          </div>
          <div className="content">
            { comment.content }
          </div>
        </div>
      </div>
    )
  }
}

export default class Fractal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fractal: null
    }
    this.load = this.load.bind(this);
  }
  async load() {
    this.setState({ fractal: await window.FU.getFractal(this.props.match.params.id) });
  }
  render() {
    return (
      <div className="fractal-page">
        <AsyncContentProvider loadCallback={this.load} className="info">
          <div className="wrapper">
            <FractalView fractal={this.state.fractal} />
            <FractalStatistic statistic={{likes: 10, dislikes: 20, favorites: 1}} />
          </div>
            <Paginator className="comments-list" onSearch={async (page) => {
              let result = {
                maxPage: 1,
                comments: [
                  {
                    user: window.FU.loggedAs,
                    date: new Date(2001, 12, 20, 17, 30),
                    content: "Первый коментарий"
                  },
                  {
                    user: window.FU.loggedAs,
                    date: new Date("2019-02-01T00:00:00"),
                    content: "Второй коментарий"
                  },
                  {
                    user: window.FU.loggedAs,
                    date: new Date("2019-07-19T12:46:00"),
                    content: "Третий коментарий"
                  }
                ]
              }//await window.FU.searchComments(fractal.id, page);
              return {
                rows: result.comments,
                maxPages: result.maxPages
              }
            }} row={(comment, search) => {
              return (
                <UserComment comment={comment}/>
              )
            }} />
        </AsyncContentProvider>
      </div>
    )
  }
}
