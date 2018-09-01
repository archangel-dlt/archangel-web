import React, { Component, PureComponent, Fragment } from 'react';
import { SipInfo, FileList, Field } from '@archangeldlt/web-common';

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
        <form className='form-group row' onSubmit={event => this.handleSubmit(event)}>
          <div className='row col-md-12'>
              <Field
              placeholder='Search Archangel - text search or file hash'
              onValue={v => this.handleChange(v)}
            />
          </div>
          <div className='row col-md-12'>
            <button
              type='submit'
              className='btn btn-primary offset-md-10 col-md-2'
              disabled={!this.state.searchTerm}>Search
            </button>
          </div>
        </form>
      </div>
    )
  } // react
} // SearchBox

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: null
    }
  } // constructor

  clear() {
    this.setSearchResults(null, null);
    this.setErrors(null);
  } // clear

  setSearchResults(searchTerm, results, searchFn) {
    this.setState({
      searchTerm: searchTerm,
      searchResults: results,
      searchFn: searchFn
    });
  } // setSearchResults

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {searchTerm, searchResults, errors} = this.state;

    if (!searchResults && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(searchTerm, searchResults);
  } // render

  renderErrors(errors) {
    return (
      <div>
        <div className='row'>
          <div className='col-md-12'><strong>Search failed</strong></div>
        </div>
        <div className='row'>
          <div className='col-md-12'>{ errors.message || errors.error }</div>
          <div className='col-md-12'>{ JSON.stringify(errors) }</div>
        </div>
      </div>
    )
  } // renderErrors

  renderResult(result) {
    const record = result[0];
    //const prev = result.slice(1);

    return (
      <Fragment>
        <SipInfo initialData={record.data} readonly={true}/>
        <FileList files={record.files} readonly={true}/>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-6 offset-2'>Contains {record.files.length} file{record.files.length > 1 ? 's' : '' }.</div>
            <div className="col-4">Uploaded by <strong>{record.uploader}</strong> at {record.timestamp} </div>
          </div>
        </div>
        <hr/>
      </Fragment>
    )
  };

  renderResults(searchTerm, searchResults) {
    searchResults = searchResults || [];
    searchResults.reverse();

    const found = searchResults.length;
    return (
      <div>
        <div className='row'>
          <div className='col-md-12'>
            <span className='float-right'>
            {found ?
              `${found} SIP${found>1 ? 's' : ''} found` :
              'No SIPs found'
            }
            </span>
            <h3>Searched for <strong>{searchTerm}</strong></h3>
          </div>
        </div>
        <div className='row'>
          <br className='col-md-12'/>
        </div>
        {
          searchResults.map(r => this.renderResult(r))
        }
        <div className='row'>
          <hr className='col-md-12'/>
        </div>
      </div>
    )
  } // renderResults
} // SearchResults

class Search extends PureComponent {
  get driver() { return this.props.driver; }

  onSearch(searchTerm) {
    this.resultsBox.clear();
    this.driver.search(searchTerm)
      .then(results => this.resultsBox.setSearchResults(searchTerm, results, this.onSearch))
      .catch(error => this.resultsBox.setErrors(error));
  } // onSearch

  render() {
    return (
      <div>
        <SearchBox onSearch={searchTerm => this.onSearch(searchTerm)}/>
        <SearchResults ref={resultsBox => this.resultsBox = resultsBox}/>
      </div>
    );
  } // render
} // Search

export default Search;
