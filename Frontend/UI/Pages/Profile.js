import React, { Component } from "react";

import Button from "../Elements/Button";
import AsyncButton from "../Elements/AsyncButton";
import Input from "../Elements/Input";
import Draggable from "../Elements/Draggable";
import ColorPicker from "../Elements/ColorPicker";

import "../../styles/Pages/Profile.sass";

import AddIcon from "../Icons/Add";

import { decimal2hex } from "../../logic/utils";

// Получаем обратный цвет
function oppositeColor(color) {
  let newColor = ((color & 0xFF) * 0.299 + ((color >> 8) & 0xFF) * 0.587 + ((color >> 16) & 0xFF) * 0.114) > 186 ? 0x000000 : 0xFFFFFF;
  return newColor;
}

function generatePallete(array, callback) {
  return array.map((color, index) => {
    let hex = decimal2hex(color, 6);
    let textColorHex = decimal2hex(oppositeColor(color), 6);
    return callback(hex, textColorHex, index);
  });
}

function generateGradation(from, to, steps, skipFirst) {
  let colors = []
  let alpha = 0;
  for (let j = 0; j < steps; j++) {
    let color = Math.floor(((from & 0xFF) * alpha + (1 - alpha) * (to & 0xFF)) + ((((from >> 8) & 0xFF) * alpha + (1 - alpha) * ((to >> 8) & 0xFF)) << 8) + ((((from >> 16) & 0xFF) * alpha + (1 - alpha) * ((to >> 16) & 0xFF)) << 16));
    colors.push(color)
      alpha += 1.0 / steps;
  }
  return colors;
}

function generateGradations(colors, steps) {
  let gradations = []
  for (let i = 0; i < colors.length - 1; i++) {
    gradations = gradations.concat(generateGradation(colors[i + 1], colors[i], steps));
  }
  gradations.push(colors[colors.length - 1]);
  return gradations;
}

class EditPalettePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.palette.name,
      colors: this.props.palette.colors,
      gradations: this.props.palette.gradations,
      colorPicked: null
    }
  }
  render() {
    return (
      <div className="edit-palette-popup popup" onClick={({ target }) => {
        while (target) {
          if (target.classList.contains("color-picker-container")) return;
          if (target.classList.contains("edit-palette-popup") && this.state.colorPicked != null) {
            this.setState({ colorPicked: null });
            return;
          }
          target = target.parentElement;
        }
      }}>
        <div className="header">
          { gettext("Palette change") }
        </div>
        <div className="palette-edit">
          <div className="palette">
            <Input type="text" name="name" placeholder={gettext("Name")} parent={this} />
            <Input type="number" name="gradations" placeholder={gettext("Gradations")} min={0} parent={this} />
            <div className="gradation" onClick={(event) => {
              // event.persist();
              // console.log(event)
            }}>
              { generatePallete(generateGradations(this.state.colors, Number(this.state.gradations) + 1), (color, textColor, index) => {
                let realIndex = index / (Number(this.state.gradations) + 1)
                return (
                  <div key={index} style={{backgroundColor: "#" + color, color: "#" + textColor}} className={`color ${(index % (Number(this.state.gradations) + 1) == 0) ? "editable" : ""}`} onClick={((index % (Number(this.state.gradations) + 1) == 0) ? (({ target }) => {
                    if (target.classList.contains("color")) {
                      this.setState({ colorPicked: realIndex });
                    }
                  }) : null)}> { this.state.colorPicked == realIndex ? <ColorPicker color={color} onChange={(color) => {
                    this.setState((old) => {
                      old.colors[realIndex] = color
                      return old;
                    });
                  }} onClose={() => {
                    this.setState({ colorPicked: null });
                  }}/> : null } </div>
                )
              }) }
            </div>
            <Button onClick={() => {
              this.setState((old) => {
                let colors = old.colors;
                colors.push(0x000000);
                return old;
              });
            }}>
              Add
            </Button>
          </div>
        </div>
        <div className="buttons">
          <AsyncButton onClick={async () => {
            let result = await window.FU.addPalette(this.state.name, this.state.colors, this.state.gradations);
            if (!result.success) {
              if (result.name) {
                this.setState({ nameError: result.name });
              }
              return;
            }
            this.props.onSave(result);
            window.hidePopup();
          }}>
            { gettext("Save") }
          </AsyncButton>
          <Button onClick={() => window.hidePopup()}>
            { gettext("Cancel") }
          </Button>
        </div>
      </div>
    )
  }
}

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      palettes: null
    }
  }
  async componentDidMount() {
    this.setState({ palettes: await window.FU.getPalettes() });
  }
  render() {
    return (
      <div className="profile-page">
        <div className="user-profile">
          <div className="user-avatar">
            <img src={window.FU.loggedAs.avatar} />
          </div>
          <div className="user-info">
            <div className="login">
              Zabqer
            </div>
            <div className="email">
              zabqer@gmail.com
            </div>
          </div>
          <div className="premium-badget">
            { gettext("Premium") }
          </div>
        </div>
        <div className="profile-settings">
          <div className="list-palettes">
            <h2 className="description">
              { gettext("Your palettes") }
            </h2>
            <div className="list">
              { this.state.palettes ? (
                this.state.palettes.map((palette, index) => {
                  return (
                    <div className="palette" key={index}>
                      <div className="name">
                        { palette.name }
                      </div>
                      <div className="palette-view">
                        <div className="gradation">
                          { generatePallete(generateGradations(palette.colors, Number(palette.gradations) + 1), (color, textColor, index) => {
                            return (
                              <div key={index} style={{backgroundColor: "#" + color, color: "#" + textColor}}> </div>
                            );
                          }) }
                        </div>
                        <AsyncButton onClick={async () => {
                          let result = await window.FU.deletePalette(palette.id);
                          if (!result.detail) {
                            this.setState((old) => {
                              let index;
                              for (let i in old.palettes) {
                                if (old.palettes[i] == palette.id) {
                                  index = i;
                                  break;
                                }
                              }
                              old.palettes.splice(index, 1);
                              return old;
                            });
                          }
                        }}>
                          D
                        </AsyncButton>
                      </div>
                    </div>
                  )
                })
              ) : null }
              <Button onClick={() => {
                window.showPopup(<EditPalettePopup palette={{name: "", colors: [0x000000, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFFFF], gradations: 10}} onSave={async (result) => {
                  this.setState((old) => {
                    old.palettes.push({
                      id: result.id,
                      name: result.name,
                      colors: result.colors,
                      gradations: result.gradations
                    })
                    return old;
                  });
                }}/>);
              }}>
                { gettext("Add") }
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
