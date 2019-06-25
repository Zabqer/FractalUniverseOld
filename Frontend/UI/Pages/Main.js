import React, { Component, Fragment } from "react";
import { Link} from "react-router-dom";

import Paginator from "../Elements/Paginator";
import DimensionMap from "../Elements/DimensionMap";

import "../../styles/Pages/Main.sass";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  async componentDidMount() {
  }
  render() {
    return (
      <div className="main-page">
        <Paginator className="dimensions-list" searchText={ gettext("Name") } onSearch={async (keywords, page) => {
          let result = await window.FU.searchAllDimensions(keywords, page);
          return {
            rows: result.dimensions,
            maxPages: result.maxPages
          }
        }} header={(search) => {
          return (
            <Fragment>
            </Fragment>
          )
        }} row={(dimension, search) => {
          return (
            <div className="dimension">
              <Link to={`/dimension/${dimension.id}`}>
                <DimensionMap dimension={dimension} />
              </Link>
            </div>
          )
        }} />
      </div>
    )
  }
}
