import React, { Component, Fragment } from "react";

import Palette from "../Elements/Palette";
import Paginator from "../Elements/Paginator";

class SelectPalettePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  render() {
    return (
      <div className="popup select-palette-popup">
        <div className="header">
          { gettext("Platette select") }
        </div>
        <Paginator className="palettes-list" searchText={ gettext("Name") } onSearch={async (keywords, page) => {
          let result = await window.FU.searchPalettes(keywords, page);
          return {
            rows: result.palettes,
            maxPages: result.maxPages
          }
        }} header={(search) => {
          return (
            <Fragment>
            </Fragment>
          )
        }} row={(palette, search) => {
          return (
            <div className="platette" onClick={async () => {
                let result = await window.FU.setPalette(palette.id);
                if (result === true) {
                  window.hidePopup();
                } else {
                  window.showError(result);
                }
              }}>
              <Palette colors={palette.colors} gradations={palette.gradations} />
            </div>
          )
        }} />
      </div>
    )
  }
}

export default function selectPalette() {
  window.showPopup(<SelectPalettePopup />);
}
