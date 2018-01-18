import React, {Component} from 'react';
import prettysize from '../lib/prettysize';
import Puid from './Puid';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
    this.onSearch = props.onSearch;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // constructor

  handleChange(event) {
    this.setState({searchTerm: event.target.value});
  } // handleChange

  handleSubmit(event) {
    if (this.state.searchTerm)
      this.onSearch(this.state.searchTerm);
    event.preventDefault();
  } // handleSubmit

  render() {
    return (
      <form className="form-group row" onSubmit={this.handleSubmit}>
        <div className="row col-md-12">
          <input
            type="text"
            className="form-control col-md-12"
            placeholder="Search Archangel"
            value={this.state.searchTerm}
            onChange={this.handleChange}/>
        </div>
        <div className="row col-md-12">
          <div className="col-md-10"/>
          <button
            type="submit"
            className="btn btn-primary col-md-2"
            disabled={!this.state.searchTerm}>Search
          </button>
        </div>
      </form>
    )
  } // react
} // SearchBox

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchResults: null,
      searchResults: null
    }
  } // constructor

  clear() {
    this.setFetchResults(null, null);
    this.setSearchResults(null, null);
    this.setErrors(null);
  } // clear

  setFetchResults(searchTerm, results) {
    this.setState({
      searchTerm: searchTerm,
      fetchResults: results
    });
  } // setFetchResults

  setSearchResults(searchTerm, results) {
    this.setState({
      searchTerm: searchTerm,
      searchResults: results
    });
  } // setSearchResults

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {searchTerm, fetchResults, searchResults, errors} = this.state;

    if (!fetchResults && !searchResults && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(searchTerm, fetchResults, searchResults);
  } // render

  renderErrors(errors) {
    return (
      <div>
        <div className="row">
          <div className="col-md-12"><strong>Search failed</strong></div>
        </div>
        <div className="row">
          <div className="col-md-12">{ errors.message || errors.error }</div>
        </div>
      </div>
    )
  } // renderErrors

  renderResults(searchTerm, fetchResults, searchResults) {
    fetchResults = fetchResults || []
    searchResults = searchResults || []

    const found = fetchResults.length + searchResults.length;
    const formatResult = record => {
      if (record.sha256_hash)
        return (
          <div className="row" key={record.sha256_hash}>
            <div className="row col-md-12">
              <div className="col-md-8"><strong>{record.name}</strong></div>
              <div className="col-md-2"><Puid fmt={record.puid}/></div>
              <div className="col-md-2">{ prettysize(record.size, true) }</div>
            </div>
            <div className="row col-md-12">
              <div className="col-md-8">{record.sha256_hash}</div>
              <div className="col-md-4">Last Modified: {record.last_modified}</div>
            </div>
            <div className="row col-md-12">
              <div className="col-md-6">{record.comment}</div>
              <div className="col-md-6">Uploaded: {record.timestamp}</div>
            </div>
          </div>
        )

      return (
        <div className="row" key={record.timestamp}>
          <div className="col-md-2">{record.id}</div>
          <div className="col-md-7">{record.payload}</div>
          <div className="col-md-3">{record.timestamp}</div>
        </div>
      )
    };

    return (
      <div>
        <div className="row">
          <div className="col-md-12">Searched for <strong>{searchTerm}</strong></div>
        </div>
          {
            fetchResults.length ?
              <div className="row">
                <hr className="col-md-12"/>
                <div className="col-md-12">With matching key</div>
              </div>
            :
              null
          }
          {
            fetchResults.map(formatResult)
          }
          {
            searchResults.length ?
            <div className="row">
              <hr className="col-md-12"/>
              <div className="col-md-12">With matching payload</div>
            </div>
            :
            null
          }
          {
            searchResults.map(formatResult)
          }
        <div className="row">
          <hr className="col-md-12"/>
        </div>
        <div className="row">
          <div className="col-md-12">
            <span className="float-right">
            {found ?
              `${found} records found` :
              "No records found"
            }
            </span>
          </div>
        </div>
      </div>
    )
  } // renderResults
} // SearchResults

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driver: props.driver
    };

    this.onSearch = this.onSearch.bind(this);
  } // constructors

  componentWillReceiveProps(props) {
    this.setState({
      driver: props.driver
    });
  } // componentWillReceiveProps

  onSearch(searchTerm) {
    this.resultsBox.clear();
    this.state.driver.fetch(searchTerm)
      .then(results => this.resultsBox.setFetchResults(searchTerm, results))
      .catch(error => this.resultsBox.setErrors(error));
    this.state.driver.search(searchTerm)
      .then(results => this.resultsBox.setSearchResults(searchTerm, results))
      .catch(error => this.resultsBox.setErrors(error));
  } // onSearch

  render() {
    return (
      <div>
        <SearchBox onSearch={this.onSearch}/>
        <SearchResults ref={resultsBox => this.resultsBox = resultsBox}/>
      </div>
    );
  } // render
} // Search

export default Search;