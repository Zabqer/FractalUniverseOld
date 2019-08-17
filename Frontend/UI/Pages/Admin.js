import React, { Component, Fragment } from "react";

import "../../styles/Pages/Admin.sass";

import { Tabs, Tab } from "../Elements/Tabs";

import Palette from "../Elements/Palette";
import Button from "../Elements/Button";
import Input from "../Elements/Input";
import AsyncButton from "../Elements/AsyncButton";
import Paginator from "../Elements/Paginator";
import { openDimensionMap } from "../Elements/DimensionMap";

import EditPalettePopup from "../Popups/EditPalettePopup";
import PermissionRequired from "../PermissionRequired";

import { formatDate } from "../../logic/utils";
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
                try {
                  let result = await window.FU.addUniverse(this.state.name, this.state.function);
                  this.props.onSave(result.universe);
                  window.hidePopup();
                } catch (e) {
                  if (e.detail) {
                    window.showError(e.detail);
                  }
                  if (e.name) {
                    this.setState({ nameError: e.name });
                  }
                  if (e.function) {
                    this.setState({ functionError: e.function });
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
              try {
                let result = await window.FU.addDimension(this.props.universe, this.state.name, this.state.parameter);
                this.props.onSave(result.dimension);
                window.hidePopup();
              } catch (e) {
                if (e.detail) {
                  window.showError(e.detail);
                }
                if (e.name) {
                  this.setState({ nameError: e.name });
                }
                if (e.parameter) {
                  this.setState({ parameterError: e.parameter });
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

class UniversesTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUniverse: null,
      selectedDimension: null,
      changeFlag: false
    }
  }
  render() {
    return (
      <Fragment>
        <h2> { gettext("Universes") } </h2>
        <Paginator className="universes-paginator" searchText={ gettext("Name or function") } index={this.state.changeFlag} onSearch={async (keywords, page) => {
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
              <div className="column-active">
                { gettext("Active") }
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
        }} row={(universe, search) => {
          return (
            <Fragment>
              <div className="column-id">
                { universe.id }
              </div>
              <div className="column-active">
                { universe.active ? gettext("Yes") : gettext("No") }
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
            { this.state.selectedUniverse.active ? (
              <AsyncButton onClick={async () => {
                await window.FU.editUniverse(this.state.selectedUniverse.id, {
                  active: false
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Disable") }
              </AsyncButton>
            ) : (
              <AsyncButton onClick={async () => {
                await window.FU.editUniverse(this.state.selectedUniverse.id, {
                  active: true
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Enable") }
              </AsyncButton>
            ) }
            <h2> { gettext("Dimensions") } </h2>
            <Paginator className="dimensions-paginator" index={this.state.selectedUniverse.id + "_" + this.state.changeFlag} searchText={ gettext("Name or parameter") } onSearch={async (keywords, page) => {
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
                  <div className="column-active">
                    { gettext("Active") }
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
            }} row={(dimension, search) => {
              return (
                <Fragment>
                  <div className="column-id">
                    { dimension.id }
                  </div>
                  <div className="column-active">
                    { dimension.active ? gettext("Yes") : gettext("No") }
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
          <Fragment>
            { this.state.selectedDimension.active ? (
              <AsyncButton onClick={async () => {
                await window.FU.editDimension(this.state.selectedDimension.id, {
                  active: false
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Disable") }
              </AsyncButton>
            ) : (
              <AsyncButton onClick={async () => {
                await window.FU.editDimension(this.state.selectedDimension.id, {
                  active: true
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Enable") }
              </AsyncButton>
            ) }
            <Button onClick={() => {
              openDimensionMap(this.state.selectedDimension);
            }}> { gettext("Open map") } </Button>
            <h2> { gettext("Fractals") } </h2>
            <Paginator className="fractals-paginator" index={this.state.selectedDimension.id} searchText={ gettext("Name") } onSearch={async (keywords, page) => {
                let result = await window.FU.searchFractals(this.state.selectedDimension.id, keywords, page);
                return {
                  rows: result.fractals,
                  maxPages: result.maxPages
                }
              }} header={(search) => {
                return (
                  <Fragment>
                    <div className="column-id">
                      { gettext("ID") }
                    </div>
                    <div className="column-active">
                      { gettext("Active") }
                    </div>
                    <div className="column-x">
                      { gettext("X") }
                    </div>
                    <div className="column-y">
                      { gettext("Y") }
                    </div>
                    <div className="column-buttons">
                      <Button withIcon={AddIcon} onClick={() => {
                        window.showPopup(<AddFractalPopup fractal={this.state.selectedFractal.id} onSave={() => {
                          search(1);
                        }} />)
                      }}> </Button>
                    </div>
                  </Fragment>
                )
              }} row={(fractal, search) => {
                return (
                  <Fragment>
                    <div className="column-id">
                      { fractal.id }
                    </div>
                    <div className="column-active">
                      { fractal.active ? gettext("Yes") : gettext("No") }
                    </div>
                    <div className="column-x">
                      { fractal.x }
                    </div>
                    <div className="column-y">
                      { fractal.y }
                    </div>
                    <div className="column-buttons">
                      <Button withIcon={DeleteIcon} onClick={async () => {
                          await window.FU.deleteFractal(fractal.id);
                          search();
                      }}> </Button>
                    </div>
                  </Fragment>
                )
              }} onSelect={(fractal) => {
                this.setState({ selectedFractal: fractal });
              }} />
              { this.state.selectedFractal ? (
                <Fragment>
                  { this.state.selectedFractal.active ? (
                    <AsyncButton onClick={async () => {
                      await window.FU.editFractal(this.state.selectedFractal.id, {
                        active: false
                      });
                      this.setState({ changeFlag: !this.state.changeFlag })
                    }}>
                      { gettext("Disable") }
                    </AsyncButton>
                  ) : (
                    <AsyncButton onClick={async () => {
                      await window.FU.editFractal(this.state.selectedFractal.id, {
                        active: true
                      });
                      this.setState({ changeFlag: !this.state.changeFlag })
                    }}>
                      { gettext("Enable") }
                    </AsyncButton>
                  ) }
                </Fragment>
              ) : null }
          </Fragment>
        ) : null }
      </Fragment>
    )
  }
}

class PalettesTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPalette: null
    }
  }
  render() {
    return (
      <Paginator className="palettes-paginator" searchText={ gettext("ID or name") } onSearch={async (keywords, page) => {
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
                }} global={true} />)
              }}> </Button>
            </div>
          </Fragment>
        )
      }} row={(palette, search) => {
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
              { palette.user || "-" }
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
    )
  }
}

class UsersTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: null,
      changeFlag: false
    }
  }
  render() {
    return (
      <div className="users-tab">
        <Paginator className="users-paginator" searchText={ gettext("Name") } index={this.state.changeFlag} onSearch={async (keywords, page) => {
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
              <div className="column-username">
                { gettext("Username") }
              </div>
              <div className="column-email">
                { gettext("Email") }
              </div>
              <div className="column-verified">
                { gettext("Verified") }
              </div>
              <div className="column-blocked">
                { gettext("Blocked") }
              </div>
              <div className="column-buttons">
              </div>
            </Fragment>
          )
        }} row={(user, search) => {
          return (
            <Fragment>
              <div className="column-id">
                { user.id }
              </div>
              <div className="column-username">
                { user.username }
              </div>
              <div className="column-email">
                { user.email }
              </div>
              <div className="column-verified">
                { user.verified ? gettext("Yes") : gettext("No") }
              </div>
              <div className="column-blocked">
                { user.blocked ? gettext("Yes") : gettext("No") }
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
        { this.state.selectedUser && (
          <Fragment>
            { !this.state.selectedUser.verified && (
              <AsyncButton onClick={async () => {
                await window.FU.activateEmail(this.state.selectedUser.id);
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Activate") }
              </AsyncButton>
            ) }
            { this.state.selectedUser.blocked ? (
              <AsyncButton onClick={async () => {
                await window.FU.editUser(this.state.selectedUser.id, {
                  blocked: false
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Unblock") }
              </AsyncButton>
            ) : (
              <AsyncButton onClick={async () => {
                await window.FU.editUser(this.state.selectedUser.id, {
                  blocked: true
                });
                this.setState({ changeFlag: !this.state.changeFlag })
              }}>
                { gettext("Block") }
              </AsyncButton>
            ) }
          </Fragment>
        ) }
      </div>
    )
  }
}

class TasksTab extends Component {
  render() {
    return (
      <Paginator className="tasks-paginator" searchText={ gettext("ID") } onSearch={async (keywords, page) => {
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
            <div className="column-fractal">
              { gettext("Fractal") }
            </div>
            <div className="column-state">
              { gettext("State") }
            </div>
          </Fragment>
        )
      }} row={(task, search) => {
        return (
          <Fragment>
            <div className="column-id">
              { task.id }
            </div>
            <div className="column-fractal">
              { task.fractal.id }
            </div>
            <div className="column-state">
              { task.fractal.state }
            </div>
          </Fragment>
        )
      }} />
    )
  }
}

class SessionsTab extends Component {
  render() {
    return (
      <Paginator className="sessions-paginator" searchText={ gettext("Date") } onSearch={async (keywords, page) => {
        let result = await window.FU.searchSessions(keywords, page);
        return {
          rows: result.sessions,
          maxPages: result.maxPages
        }
      }} header={(search) => {
        return (
          <Fragment>
            <div className="column-id">
              { gettext("ID") }
            </div>
            <div className="column-user">
              { gettext("User") }
            </div>
            <div className="column-created">
              { gettext("Created") }
            </div>
            <div className="column-remember">
              { gettext("Remember") }
            </div>
            <div className="column-expireAt">
              { gettext("Expire at") }
            </div>
            <div className="column-buttons">
            </div>
          </Fragment>
        )
      }} row={(session, search) => {
        let currentSession = session.key == window.FU.token ? " current" : "";
        return (
          <Fragment>
            <div className={`column-id${currentSession}`}>
              { session.id }
            </div>
            <div className={`column-user${currentSession}`}>
              { session.user }
            </div>
            <div className={`column-created${currentSession}`}>
              { formatDate(session.created) }
            </div>
            <div className={`column-created${currentSession}`}>
              { session.remember ? gettext("Yes") : gettext("No") }
            </div>
            <div className={`column-expireAt${currentSession}`}>
              { session.expireAt ? formatDate(session.expireAt) : gettext("Deleted") }
            </div>
            <div className={`buttons${currentSession}`}>
              { session.expireAt ? (
                <Button withIcon={DeleteIcon} onClick={async () => {
                    await window.FU.deleteSession(session.id, session.user);
                    if (window.FU.loggedAs && session.key == window.FU.token) {
                      window.FU.token = null;
                      window.FU.expireAt = null;
                      window.FU.loggedAs = null;
                      localStorage.removeItem("token");
                      localStorage.removeItem("expire_at");
                      window.update();
                    } else {
                      search();
                    }
                }}> </Button>
              ) : null }
            </div>
          </Fragment>
        )
      }} />
    )
  }
}

export default class Admin extends PermissionRequired {
  constructor(props) {
    super(props, {
      isAdmin: true
    });
  }
  renderWithPermissions() {
     return (
      <div className="admin-page">
        <Tabs>
          <Tab title={ gettext("Universes") }>
            <UniversesTab />
          </Tab>
          <Tab title={ gettext("Palettes") }>
            <PalettesTab />
          </Tab>
          <Tab title={ gettext("Users") }>
            <UsersTab />
          </Tab>
          <Tab title={ gettext("Tasks") }>
            <TasksTab />
          </Tab>
          <Tab title={ gettext("Sessions") }>
            <SessionsTab />
          </Tab>
          <Tab title={ gettext("Config") }>
            Tab with config
          </Tab>
        </Tabs>
      </div>
    )
  }
}
