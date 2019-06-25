import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

import Button from "../Elements/Button";
import Paginator from "../Elements/Paginator";
import Fractal from "../Elements/Fractal";
import AsyncContentProvider from "../AsyncContentProvider"
import AddFractalPopup from "../Popups/AddFractalPopup";

import AddIcon from "../Icons/Add";

export default class Dimension extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dimension: null
    }
    this.load = this.load.bind(this);
  }
  async load() {
    this.setState({ dimension: await window.FU.getDimension(this.props.match.params.id) });
  }
  render() {
    return (
      <div className="dimension-page">
        <AsyncContentProvider loadCallback={this.load}>
          <Paginator searchText={ gettext("Name or parameter") } onSearch={async (keywords, page) => {
            let result = await window.FU.searchFractals(this.props.match.params.id, keywords, page);
            return {
              rows: result.fractals,
              maxPages: result.maxPages
            }
          }} header={(search) => {
            return (
              <Fragment>
                <Button onClick={() => {
                  window.showPopup(<AddFractalPopup dimension={this.state.dimension} onSave={() => {
                    search(1);
                  }} />);
                  }}>
                  <AddIcon />
                </Button>
              </Fragment>
            )
          }} row={(fractal, search) => {
            return (
              <Fragment>
                <Fractal fractal={fractal} />
              </Fragment>
            )
          }}/>
        </AsyncContentProvider>
      </div>
    )
  }
}
