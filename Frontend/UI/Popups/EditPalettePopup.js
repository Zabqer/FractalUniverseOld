import React, { Component, Fragment } from "react";

import Input from "../Elements/Input";
import Palette from "../Elements/Palette";
import Button from "../Elements/Button";
import AsyncButton from "../Elements/AsyncButton";

import AddIcon from "../Icons/Add";

export default class EditPalettePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      gradations: 0,
      colors: [0xFF00FF, 0x00FF00]
    }
  }
  render() {
    return (
      <div className="popup edit-palette">
        <div className="header">
          { gettext("Palette edit") }
        </div>
        <div className="content">
          <div className="row">
            <Input name="name" placeholder={gettext("Name")} parent={this} />
            <Input name="gradations" placeholder={gettext("Gradations")} type="number" min={0} parent={this} />
          </div>
          <div className="row">
            <Palette colors={this.state.colors} gradations={Number(this.state.gradations)} />
            <Button withIcon={AddIcon} onClick={() => {
              this.setState((state) => {
                state.colors.push(0x0);
                return state;
              })
            }}> </Button>
          </div>
          <div className="buttons popup-buttons">
            <AsyncButton onClick={async () => {
                let result = await window.FU.addPalette(this.state.name, this.state.colors, this.state.gradations);
                if (result.success) {
                  window.hidePopup();
                }
                this.props.onSave();
            }}> { gettext("Add") } </AsyncButton>
            <Button onClick={() => window.hidePopup()}> { gettext("Cancel") } </Button>
          </div>
        </div>
      </div>
    )
  }
}
