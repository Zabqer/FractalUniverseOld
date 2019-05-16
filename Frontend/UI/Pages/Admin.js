import React, { Component, Fragment } from "react";

import "../../styles/Pages/Admin.sass";

import { Tabs, Tab } from "../Elements/Tabs";

import Palette from "../Elements/Palette";
import Button from "../Elements/Button";
import Input from "../Elements/Input";
import AsyncButton from "../Elements/AsyncButton";
import Paginator from "../Elements/Paginator";
import openDimensionMap from "../Elements/DimensionMap";

import EditPalettePopup from "../Popups/EditPalettePopup";

//
// import AsyncContentProvider from "../AsyncContentProvider";
//
//
import AddIcon from "../Icons/Add";
import SaveIcon from "../Icons/Save";
import EditIcon from "../Icons/Edt";
import DeleteIcon from "../Icons/Delete";

class AddUniversePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      nameError: null,
      function: "",
      functionError: null
    }
  }
  render() {
    return (
      <div className="edit-universe-popup popup">
        <div className="header">
          { gettext("Universe add") }
        </div>
        <div className="content">
          <Input name="name" parent={this} placeholder={ gettext("Name") } />
          <Input name="function" parent={this} placeholder={ gettext("Function") } />
          <div className="buttons popup-buttons">
            <AsyncButton onClick={async () => {
              let result = await window.FU.addUniverse(this.state.name, this.state.function);
              if (result.success) {
                this.props.onSave(result.universe);
                window.hidePopup();
              } else {
                if (result.detail) {
                  window.showError(result.detail);
                }
                if (result.name) {
                  this.setState({ nameError: result.name });
                }
                if (result.function) {
                  this.setState({ functionError: result.function });
                }
              }
            }}> { gettext("Add") } </AsyncButton>
            <Button onClick={() => window.hidePopup()}> { gettext("Cancel") } </Button>
          </div>
        </div>
      </div>
    )
  }
}

class AddDimensionPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      nameError: null,
      parameter: "",
      parameterError: null
    }
  }
  render() {
    return (
      <div className="edit-universe-popup popup">
        <div className="header">
          { gettext("Dimension add") }
        </div>
        <div className="content">
          <Input name="name" parent={this} placeholder={ gettext("Name") } />
          <Input name="parameter" parent={this} placeholder={ gettext("Parameter") } />
          <div className="buttons popup-buttons">
            <AsyncButton onClick={async () => {
              let result = await window.FU.addDimension(this.props.universe, this.state.name, this.state.parameter);
              if (result.success) {
                this.props.onSave(result.dimension);
                window.hidePopup();
              } else {
                if (result.detail) {
                  window.showError(result.detail);
                }
                if (result.name) {
                  this.setState({ nameError: result.name });
                }
                if (result.parameter) {
                  this.setState({ parameterError: result.parameter });
                }
              }
            }}> { gettext("Add") } </AsyncButton>
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
      selectedUniverse: null,
      selectedDimension: null
    }
  }
  componentDidMount() {

  }
  render() {
     return (
      <div className="admin-page">
        <Tabs>
          <Tab title={ gettext("Universes") }>
            <h2> { gettext("Universes") } </h2>
            <Paginator searchText={ gettext("Name or function") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchUniverses(keywords, page);
              return {
                rows: result.universes,
                maxPages: result.maxPages
              }
            }} header={(search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { gettext("ID") }
                  </div>
                  <div className="column-name">
                    { gettext("Name") }
                  </div>
                  <div className="column-function">
                    { gettext("Function") }
                  </div>
                  <div className="column-buttons">
                    <Button withIcon={AddIcon} onClick={() => {
                      window.showPopup(<AddUniversePopup onSave={() => {
                        search(1);
                      }} />)
                    }}> </Button>
                  </div>
                </Fragment>
              )
            }} columns={4} row={(universe, search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { universe.id }
                  </div>
                  <div className="column-name">
                    { universe.name }
                  </div>
                  <div className="column-function">
                    { universe.function }
                  </div>
                  <div className="column-buttons">
                    <Button withIcon={DeleteIcon} onClick={async () => {
                        await window.FU.deleteUniverse(universe.id);
                        search();
                    }}> </Button>
                  </div>
                </Fragment>
              )
            }} onSelect={(universe) => {
              this.setState({ selectedUniverse: universe, selectedDimension: null });
            }} />
            { this.state.selectedUniverse ? (
              <Fragment>
                <h2> { gettext("Dimensions") } </h2>
                <Paginator index={this.state.selectedUniverse.id} searchText={ gettext("Name or parameter") } onSearch={async (keywords, page) => {
                  let result = await window.FU.searchDimensions(this.state.selectedUniverse.id, keywords, page);
                  return {
                    rows: result.dimensions,
                    maxPages: result.maxPages
                  }
                }} header={(search) => {
                  return (
                    <Fragment>
                      <div className="column-id">
                        { gettext("ID") }
                      </div>
                      <div className="column-name">
                        { gettext("Name") }
                      </div>
                      <div className="column-parameter">
                        { gettext("Parameter") }
                      </div>
                      <div className="column-buttons">
                        <Button withIcon={AddIcon} onClick={() => {
                          window.showPopup(<AddDimensionPopup universe={this.state.selectedUniverse.id} onSave={() => {
                            search(1);
                          }} />)
                        }}> </Button>
                      </div>
                    </Fragment>
                  )
                }} columns={4} row={(dimension, search) => {
                  return (
                    <Fragment>
                      <div className="column-id">
                        { dimension.id }
                      </div>
                      <div className="column-name">
                        { dimension.name }
                      </div>
                      <div className="column-parameter">
                        { dimension.parameter }
                      </div>
                      <div className="column-buttons">
                        <Button withIcon={DeleteIcon} onClick={async () => {
                            await window.FU.deleteDimension(dimension.id);
                            search();
                        }}> </Button>
                      </div>
                    </Fragment>
                  )
                }} onSelect={(dimension) => {
                  this.setState({ selectedDimension: dimension });
                }} />
              </Fragment>
            ) : null }
            { this.state.selectedDimension ? (
              <Button onClick={() => {
                openDimensionMap(this.state.selectedDimension);
              }}> { gettext("Open map") } </Button>
            ) : null }
          </Tab>
          <Tab title={ gettext("Palettes") }>
            <Paginator searchText={ gettext("ID or name") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchPalettes(keywords, page);
              return {
                rows: result.palettes,
                maxPages: result.maxPages
              }
            }} header={(search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { gettext("ID") }
                  </div>
                  <div className="column-name">
                    { gettext("Name") }
                  </div>
                  <div className="column-palette">
                    { gettext("Palette") }
                  </div>
                  <div className="column-user">
                    { gettext("User") }
                  </div>
                  <div className="column-buttons">
                    <Button withIcon={AddIcon} onClick={() => {
                      window.showPopup(<EditPalettePopup onSave={() => {
                        search(1);
                      }} />)
                    }}> </Button>
                  </div>
                </Fragment>
              )
            }} columns={5} row={(palette, search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { palette.id }
                  </div>
                  <div className="column-name">
                    { palette.name }
                  </div>
                  <div className="column-palette">
                    <Palette colors={palette.colors} gradations={palette.gradations} />
                  </div>
                  <div className="column-user">
                    { palette.user }
                  </div>
                  <div className="buttons">
                    <Button withIcon={DeleteIcon} onClick={async () => {
                        await window.FU.deletePalette(palette.id);
                        search();
                    }}> </Button>
                  </div>
                </Fragment>
              )
            }} onSelect={(palette) => {
              this.setState({ selectedPalette: palette });
            }} />
          </Tab>
          <Tab title={ gettext("Users") }>
            <Paginator searchText={ gettext("Name") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchUsers(keywords, page);
              return {
                rows: result.users,
                maxPages: result.maxPages
              }
            }} header={(search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { gettext("ID") }
                  </div>
                  <div className="column-login">
                    { gettext("Login") }
                  </div>
                  <div className="column-email">
                    { gettext("Email") }
                  </div>
                  <div className="column-buttons">
                  </div>
                </Fragment>
              )
            }} columns={4} row={(user, search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { user.id }
                  </div>
                  <div className="column-login">
                    { user.login }
                  </div>
                  <div className="column-email">
                    { user.email }
                  </div>
                  <div className="column-buttons">
                    <Button withIcon={DeleteIcon} onClick={async () => {
                        await window.FU.deleteUser(user.id);
                        search();
                    }}> </Button>
                  </div>
                </Fragment>
              )
            }} onSelect={(user) => {
              this.setState({ selectedUser: user });
            }} />
          </Tab>
          <Tab title={ gettext("Tasks") }>
            <Paginator searchText={ gettext("ID") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchTasks(keywords, page);
              return {
                rows: result.tasks,
                maxPages: result.maxPages
              }
            }} header={(search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { gettext("ID") }
                  </div>
                  <div className="column-drawable">
                    { gettext("Drawable") }
                  </div>

                  <div className="column-state">
                    { gettext("State") }
                  </div>
                </Fragment>
              )
            }} columns={3} row={(task, search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { task.id }
                  </div>
                  <div className="column-drawable">
                    { task.drawable.id }
                  </div>
                  <div className="column-state">
                    { task.drawable.state }
                  </div>
                </Fragment>
              )
            }} />
          </Tab>
          <Tab title={ gettext("Config") }>
            Tab with config
          </Tab>
        </Tabs>
      </div>
    )
  }
}

// <AsyncContentProvider loadCallback={this.loadUniverses}>
//   <h2> Вселенные </h2>
//   <div className="row">
//     <Dropdown selected={this.state.selectedUniverse && this.state.selectedUniverse.id} variants={ this.state.universes.map((universe) => {
//       return { value: universe.function, id: universe.id }
//     }) } onSelect={(id) => {
//       this.setState({ selectedUniverse: this.state.universes.find((element) => element.id == id) })
//     }} placeholder="Вселенные" />
//     <Button onClick={() => {
//       window.showPopup(<EditUniversePopup onSave={(universe) => {
//         this.setState((old) => {
//           old.universes.push(universe);
//           old.selectedUniverse = old.universes[old.universes.length - 1];
//           return old;
//         });
//       }} />);
//     }} withIcon={AddIcon}> </Button>
//     <Button disabled={!this.state.selectedUniverse} onClick={() => {
//       window.showPopup(<EditUniversePopup universe={this.state.selectedUniverse} onSave={(universe) => {
//         this.setState((old) => {
//           old.universes[old.universes.indexOf(this.state.selectedUniverse)] = universe;
//           old.selectedUniverse = universe;
//           return old;
//         })
//       }} />);
//     }} withIcon={EditIcon}> </Button>
//     <AsyncButton disabled={!this.state.selectedUniverse} onClick={async () => {
//       let universe = this.state.selectedUniverse;
//       await window.FU.deleteUniverse(universe.id);
//       this.setState((old) => {
//         old.universes.splice(old.universes.indexOf(universe), 1);
//         old.selectedUniverse = old.universes[0];
//         return old;
//       })
//     }} withIcon={DeleteIcon}> </AsyncButton>
//   </div>
//   { this.state.selectedUniverse ? (
//     <AsyncContentProvider loadCallback={this.loadDimensions} index={this.state.selectedUniverse}>
//       <h2> Измерения </h2>
//       <div className="row">
//         <Dropdown selected={this.state.selectedDimension && this.state.selectedDimension.id} variants={ this.state.dimensions.map((dimension) => {
//           return { value: dimension.parameter, id: dimension.id }
//         }) } onSelect={(id) => {
//           this.setState({ selectedDimension: this.state.dimensions.find((element) => element.id == id) })
//         }} placeholder="Измерения" />
//         <Button onClick={() => {
//           window.showPopup(<EditDimentsionPopup onSave={(dimension) => {
//             this.setState((old) => {
//               old.dimensions.push(dimension);
//               old.selectedDimension = old.dimensions[old.dimensions.length - 1];
//               return old;
//             });
//           }} universe={this.state.selectedUniverse} />);
//         }} withIcon={AddIcon}> </Button>
//         <Button disabled={!this.state.selectedDimension} onClick={() => {
//           window.showPopup(<EditDimentsionPopup dimension={this.state.selectedDimension} onSave={(dimension) => {
//             this.setState((old) => {
//               old.dimensions[old.dimensions.indexOf(this.state.selectedDimension)] = dimension;
//               old.selectedDimension = dimension;
//               return old;
//             })
//           }} />);
//         }} withIcon={EditIcon}> </Button>
//         <AsyncButton disabled={!this.state.selectedDimension} onClick={async () => {
//           let dimension = this.state.selectedDimension;
//           await window.FU.deleteDimension(dimension.id);
//           this.setState((old) => {
//             old.dimensions.splice(old.dimensions.indexOf(dimension), 1);
//             old.selectedDimension = old.dimensions[0];
//             return old;
//           })
//         }} withIcon={DeleteIcon}> </AsyncButton>
//       </div>
//       <h2> { gettext("Dimension map") } </h2>
//       { this.state.selectedDimension ? (
//         <DimensionMap dimension={this.state.selectedDimension} />
//       ) : null }
//     </AsyncContentProvider>
//   ) : null }
// </AsyncContentProvider>