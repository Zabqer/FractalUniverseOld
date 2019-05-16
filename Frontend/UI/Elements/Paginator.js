import React, { Component } from "react";

import Button from "../Elements/Button";
import Input from "../Elements/Input";

import SearchIcon from "../Icons/Search";

class PageButtons extends Component {
  generatePageButton(page) {
    return (
      <div className="page-button" onClick={() => this.props.onNavigate(page)}>
        { page }
      </div>
    )
  }
  render() {
    return (
      <div className="page-buttons">
        { this.props.page > 1 && this.generatePageButton(1) }
        { this.props.page > 2 && this.generatePageButton(2) }
        { this.props.page > 4 && <div className="separator"> .. </div> }
        { this.props.page > 3 && this.generatePageButton(this.props.page - 1) }
        <div className="page-button active">
          { this.props.page }
        </div>
        { this.props.page < this.props.maxPages - 1 && this.generatePageButton(this.props.page + 1) }
        { this.props.page < this.props.maxPages - 3 && <div className="separator"> .. </div> }
        { this.props.page < this.props.maxPages - 2 && this.generatePageButton(this.props.maxPages - 1) }
        { this.props.page < this.props.maxPages && this.generatePageButton(this.props.maxPages) }
      </div>
    )
  }
}

export default class Paginator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: [],
      maxPages: 0,
      isLoading: false,
      selected: -1,
      index: this.props.index
    }
    this.changed = false;
    this.checkInput = this.checkInput.bind(this);
    this.search = this.search.bind(this);
  }
  checkInput() {
    if (this.changed) {
      this.changed = false;
      this.search(1);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.index != this.state.index) {
      nextState.index = nextProps.index;
      this.search(1);
    }
    return true;
  }
  componentDidMount() {
    this.search(1);
    setInterval(this.checkInput, 2000);
  }
  async search(page) {
    page = page || this.state.page
    this.setState({ isLoading: true });
    let result = await this.props.onSearch(this.state.search, page);
    this.setState(Object.assign(result, {
      page,
      isLoading: false,
      selected: -1
    }));
    this.props.onSelect && this.props.onSelect(null);
  }
  render() {
    return (
      <div className={`paginator ${this.state.isLoading ? "loading" : ""}`}>
        <div className="search">
          <form onSubmit={(event) => {
            event.preventDefault();
            this.search(1);
          }}>
            <Input placeholder={this.props.searchText} name="search" parent={this} onChange={() => {
              this.changed = true;
            }} />
          </form>
          <Button onClick={() => {
            this.search(1);
          }} withIcon={SearchIcon} />
        </div>
        <div className={`results ${this.props.columns && ("columns-" + this.props.columns)}`}>
          <div className="header">
            { this.props.header(this.search) }
          </div>
          { this.state.rows.length != 0 ? (
            this.state.rows.map((element, index) => {
              return (
                <div key={index} className={`row ${this.state.selected == index ? "selected" : ""}`} onClick={this.props.onSelect && (() => {
                  this.setState({ selected: index });
                  this.props.onSelect(this.state.rows[index]);
                })}>
                  { this.props.row(element, this.search) }
                </div>
              )
            })
          ) : (
            <div className="no-results">
              { gettext("Oups.. No objects found.") }
            </div>
          ) }
        </div>
        { this.state.maxPages > 2 ? (
          <PageButtons page={this.state.page} maxPages={this.state.maxPages} onNavigate={(page) => this.search(page)} />
        ) : null }
      </div>
    )
  }
}
