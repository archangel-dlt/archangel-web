import React, { Component } from 'react';
import { Field } from '@archangeldlt/web-common';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
  } // constructor

  handleChange(value) {
    this.setState({searchTerm: value});
  } // handleChange

  handleSubmit(event) {
    if (this.state.searchTerm)
      this.props.onSearch(this.state.searchTerm);
    event.preventDefault();
  } // handleSubmit

  render() {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <Field
            className='col-md-12'
            placeholder='Search Archangel - text search or file hash'
            onValue={v => this.handleChange(v)}
          />
        </div>
        <div className='row'>
          <button
            onClick={event => this.handleSubmit(event)}
            className='btn btn-success offset-md-10 col-md-2'
            disabled={!this.state.searchTerm}>Search
          </button>
        </div>
      </div>
    )
  } // react
} // SearchBox

export default SearchBox;
