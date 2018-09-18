import React, { Component } from 'react';
import { Field } from '@archangeldlt/web-common';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
  } // constructor

  updateSearchTerm(value) {
    this.setState({searchTerm: value});
  } // handleChange

  doSearch() {
    if (this.state.searchTerm)
      this.props.onSearch(this.state.searchTerm);
  } // handleSubmit

  render() {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <Field
            className='col-md-12'
            placeholder='Search Archangel - text search or file hash'
            onValue={v => this.updateSearchTerm(v)}
            onEnter={() => this.doSearch() }
          />
        </div>
        <div className='row'>
          <button
            onClick={() => this.doSearch()}
            className='btn btn-success offset-md-10 col-md-2'
            disabled={!this.state.searchTerm}>Search
          </button>
        </div>
      </div>
    )
  } // react
} // SearchBox

export default SearchBox;
