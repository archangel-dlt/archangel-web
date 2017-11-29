import React, {Component} from 'react'

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
            value={this.state.value}
            onChange={this.handleChange}/>
        </div>
        <div className="row col-md-12">
          <div className="col-md-10"/>
          <button
            type="submit"
            className="btn btn-primary col-md-2">Search
          </button>
        </div>
      </form>
    )
  } // react
} // SearchBox

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {results: null}
  } // constructor

  clear() {
    this.setResults(null, null);
    this.setErrors(null);
  } // clear

  setResults(searchTerm, results) {
    this.setState({
      searchTerm: searchTerm,
      results: results
    });
  } // setResults

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {searchTerm, results, errors} = this.state;

    if (!results && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(searchTerm, results);
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

  renderResults(searchTerm, results) {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">Searched for <strong>{searchTerm}</strong></div>
        </div>
        { results.length ?
            <div className="row">
              <hr className="col-md-12"/>
            </div>
          :
            null
        }
        {
          results.map(record => {
            return (
              <div className="row" key={record.timestamp}>
                <div className="col-md-2">{record.id}</div>
                <div className="col-md-7">{record.payload}</div>
                <div className="col-md-3">{record.timestamp}</div>
              </div>
            )
          })
        }
        <div className="row">
          <hr className="col-md-12"/>
        </div>
        <div className="row">
          <div className="col-md-12">
            <span className="float-right">
            {results.length ?
              `${results.length} records found` :
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
      .then(results => this.resultsBox.setResults(searchTerm, results))
      .catch(error => this.resultsBox.setErrors(error));
  } // onSearch

  driverUI() {
    const driver = this.state.driver;
    if (!driver)
      return null;

    return driver.render ? driver.render() : null;
  } // driverUI

  render() {
    return (
      <div>
        { this.driverUI() }
        <SearchBox onSearch={this.onSearch}/>
        <SearchResults ref={resultsBox => this.resultsBox = resultsBox}/>
      </div>
    );
  } // render
} // Search

export default Search;