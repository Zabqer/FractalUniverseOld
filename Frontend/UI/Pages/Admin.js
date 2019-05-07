import React, { Component } from "react";

import "../../styles/Pages/Admin.sass";

import Dropdown from "../Elements/Dropdown";
import Button from "../Elements/Button";
import AsyncButton from "../Elements/AsyncButton";
import Input from "../Elements/Input";

import AsyncContentProvider from "../AsyncContentProvider";

import DimensionMap from "../DimensionMap";

import AddIcon from "../Icons/Add";
import EditIcon from "../Icons/Edt";
import DeleteIcon from "../Icons/Delete";

class EditUniversePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      function: this.props.universe && this.props.universe.function || "",
      functionError: null
    }
  }
  render() {
    return (
      <div className="edit-universe-popup popup">
        <div className="header">
          { gettext("Universe change") }
        </div>
        <div className="content">
          <Input name="function" parent={this} placeholder={gettext("Function")} />
          <div className="row">
            <AsyncButton onClick={async () => {
              let universe;
              if (this.props.universe) {
                universe = await window.FU.editUniverse(this.props.universe.id, this.state.function);
              } else {
                universe = await window.FU.addUniverse(this.state.function);
              }
              if (universe.success) {
                this.props.onSave({
                  id: universe.id || this.props.universe.id,
                  function: this.state.function
                });
                window.hidePopup();
              } else {
                if (universe.detail) {
                  window.showError(universe.detail);
                }
                if (universe.function) {
                  this.setState({ functionError: universe.function });
                }
              }
            }}> { this.props.universe ? gettext("Change") : gettext("Add") } </AsyncButton>
            <Button onClick={() => window.hidePopup()}> { gettext("Cancel") } </Button>
          </div>
        </div>
      </div>
    )
  }
}

class EditDimentsionPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parameter: this.props.dimension && this.props.dimension.parameter || 0,
      parameterError: null
    }
  }
  render() {
    return (
      <div className="edit-dimension-popup popup">
        <div className="header">
          { gettext("Dimension change") }
        </div>
        <div className="content">
          <Input name="parameter" type="number" parent={this} placeholder={gettext("Parameter")} />
          <div className="row">
            <AsyncButton onClick={async () => {
              let dimension;
              if (this.props.dimension) {
                dimension = await window.FU.editDimension(this.props.dimension.id, this.state.parameter);
              } else {
                dimension = await window.FU.addDimension(this.props.universe.id, this.state.parameter);
              }
              if (dimension.success) {
                this.props.onSave({
                  id: dimension.id || this.props.dimension.id,
                  parameter: this.state.parameter
                });
                window.hidePopup();
              } else {
                if (dimension.detail) {
                  window.showError(dimension.detail);
                }
                if (dimension.function) {
                  this.setState({ parameterError: dimension.function });
                }
              }
            }}> { this.props.dimension ? gettext("Change") : gettext("Add") } </AsyncButton>
            <Button onClick={() => window.hidePopup()}> { gettext("Cancel") } </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      universes: [],
      dimensions: [],
      selectedUniverse: null,
      selectedDimension: null
    }
    this.loadUniverses = this.loadUniverses.bind(this);
    this.loadDimensions = this.loadDimensions.bind(this);
  }
  async loadUniverses() {
    let universes = await window.FU.getUniverses();
    this.setState({ universes, selectedUniverse: universes[0] })
  }
  async loadDimensions() {
    let dimensions = await window.FU.getDimensions(this.state.selectedUniverse.id);
    this.setState({ dimensions, selectedDimension: dimensions[0] })
  }
  render() {
     return (
      <div className="admin-page">
        <AsyncContentProvider loadCallback={this.loadUniverses}>
          <h2> Вселенные </h2>
          <div className="row">
            <Dropdown selected={this.state.selectedUniverse && this.state.selectedUniverse.id} variants={ this.state.universes.map((universe) => {
              return { value: universe.function, id: universe.id }
            }) } onSelect={(id) => {
              this.setState({ selectedUniverse: this.state.universes.find((element) => element.id == id) })
            }} placeholder="Вселенные" />
            <Button onClick={() => {
              window.showPopup(<EditUniversePopup onSave={(universe) => {
                this.setState((old) => {
                  old.universes.push(universe);
                  old.selectedUniverse = old.universes[old.universes.length - 1];
                  return old;
                });
              }} />);
            }} withIcon={AddIcon}> </Button>
            <Button disabled={!this.state.selectedUniverse} onClick={() => {
              window.showPopup(<EditUniversePopup universe={this.state.selectedUniverse} onSave={(universe) => {
                this.setState((old) => {
                  old.universes[old.universes.indexOf(this.state.selectedUniverse)] = universe;
                  old.selectedUniverse = universe;
                  return old;
                })
              }} />);
            }} withIcon={EditIcon}> </Button>
            <AsyncButton disabled={!this.state.selectedUniverse} onClick={async () => {
              let universe = this.state.selectedUniverse;
              await window.FU.deleteUniverse(universe.id);
              this.setState((old) => {
                old.universes.splice(old.universes.indexOf(universe), 1);
                old.selectedUniverse = old.universes[0];
                return old;
              })
            }} withIcon={DeleteIcon}> </AsyncButton>
          </div>
          { this.state.selectedUniverse ? (
            <AsyncContentProvider loadCallback={this.loadDimensions} index={this.state.selectedUniverse}>
              <h2> Измерения </h2>
              <div className="row">
                <Dropdown selected={this.state.selectedDimension && this.state.selectedDimension.id} variants={ this.state.dimensions.map((dimension) => {
                  return { value: dimension.parameter, id: dimension.id }
                }) } onSelect={(id) => {
                  this.setState({ selectedDimension: this.state.dimensions.find((element) => element.id == id) })
                }} placeholder="Измерения" />
                <Button onClick={() => {
                  window.showPopup(<EditDimentsionPopup onSave={(dimension) => {
                    this.setState((old) => {
                      old.dimensions.push(dimension);
                      old.selectedDimension = old.dimensions[old.dimensions.length - 1];
                      return old;
                    });
                  }} universe={this.state.selectedUniverse} />);
                }} withIcon={AddIcon}> </Button>
                <Button disabled={!this.state.selectedDimension} onClick={() => {
                  window.showPopup(<EditDimentsionPopup dimension={this.state.selectedDimension} onSave={(dimension) => {
                    this.setState((old) => {
                      old.dimensions[old.dimensions.indexOf(this.state.selectedDimension)] = dimension;
                      old.selectedDimension = dimension;
                      return old;
                    })
                  }} />);
                }} withIcon={EditIcon}> </Button>
                <AsyncButton disabled={!this.state.selectedDimension} onClick={async () => {
                  let dimension = this.state.selectedDimension;
                  await window.FU.deleteDimension(dimension.id);
                  this.setState((old) => {
                    old.dimensions.splice(old.dimensions.indexOf(dimension), 1);
                    old.selectedDimension = old.dimensions[0];
                    return old;
                  })
                }} withIcon={DeleteIcon}> </AsyncButton>
              </div>
              <h2> { gettext("Dimension map") } </h2>
              { this.state.selectedDimension ? (
                <DimensionMap dimension={this.state.selectedDimension} />
              ) : null }
            </AsyncContentProvider>
          ) : null }
        </AsyncContentProvider>
      </div>
    )
  }
}

// <div className="admin-page">
//   <h2> Вселенные </h2>
//   <Dropdown variants={ this.state.universes.map((universe) => {
//     return { value: universe.function, id: universe.id }
//   }) } onSelect={(id) => {
//     this.setState({ selectedUniverse: this.state.universes.find((element) => element.id == id) })
//   }} placeholder="Вселенные" />
//   <h2> Измерения </h2>
//   <Dropdown variants={ this.state.selectedUniverse.dimensions.map((dimension) => {
//     return { value: dimension.parameter, id: dimension.id }
//   }) } onSelect={(id) => {
//     this.setState({ selectedDimension: this.state.selectedUniverse.dimensions.find((element) => element.id == id) })
//   }} placeholder="Измерения" />
//   <h2> Карта  </h2>
// </div>
