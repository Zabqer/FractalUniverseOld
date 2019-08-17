import React, { Component, Fragment } from "react";

import Button from "../Elements/Button";
import AsyncButton from "../Elements/AsyncButton";
import Paginator from "../Elements/Paginator";
import Palette from "../Elements/Palette";
import EditPalettePopup from "../Popups/EditPalettePopup";
import PermissionRequired from "../PermissionRequired";

import "../../styles/Pages/Profile.sass";

import AddIcon from "../Icons/Add";
import DeleteIcon from "../Icons/Delete";

import { formatDate } from "../../logic/utils";

export default class Profile extends PermissionRequired {
  constructor(props) {
    super(props, {
      isLogin: true
    });
    this.state = {
    }
  }
  renderWithPermissions() {
    let user = window.FU.loggedAs;
    return (
      <div className="profile-page">
        <div className="column">
          <div className="user-profile">
            <div className="user-avatar">
              <img src={ user.avatar } />
            </div>
            <div className="user-info">
              <div className="login">
                { user.login }
              </div>
              <div className="email">
                { user.email }
              </div>
            </div>
            <div className="badgets">
              { user.isPremium ? (
                  <div className="premium-badget">
                    { gettext("Premium") }
                  </div>
                ) : null }
              { user.isAdmin ? (
                  <div className="admin-badget">
                    { gettext("Admin") }
                  </div>
                ) : null }
            </div>
          </div>
          <div className="list-tasks">
            <h2 className="description">
              { gettext("Your tasks") }
            </h2>
            <Paginator className="tasks-paginator" searchText={ gettext("ID") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchTasks(keywords, page, true);
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
          </div>
        </div>
        <div className="column">
          <div className="list-palettes">
            <h2 className="description">
              { gettext("Your palettes") }
            </h2>
            <Paginator className="palettes-paginator" searchText={ gettext("ID or name") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchPalettes(keywords, page, true);
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
                  <div className="column-buttons">
                    <Button withIcon={AddIcon} onClick={() => {
                      window.showPopup(<EditPalettePopup onSave={() => {
                        search(1);
                      }} global={false} />)
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
          </div>
          <div className="list-sessions">
            <h2 className="description">
              { gettext("Your sessions") }
            </h2>
            <Paginator className="sessions-paginator" searchText={ gettext("Date") } onSearch={async (keywords, page) => {
              let result = await window.FU.searchSessions(keywords, page, true);
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
                          await window.FU.deleteSession(session.id);
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
          </div>
        </div>
      </div>
    )
  }
}
