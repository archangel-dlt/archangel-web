import React, {Component} from 'react'

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {searchTerm: ''};
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
  }

  render() {
    return (
      <form className="form-group row" onSubmit={this.handleSubmit}>
        <input
          type="text"
          className="form-control col-md-10"
          placeholder="Search Archangel"
          value={this.state.value}
          onChange={this.handleChange}/>
        <button
          type="submit"
          className="btn btn-primary col-md-2"
          onClick={this.handleSubmit}>Search
        </button>
      </form>
    )
  } // react
} // SearchBox

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {results: []}
  }
  setResults(results) {
    this.setState({results: results})
  } // setResults

  render() {
    return (
      <div class="row">
        <div className="col-md-10"></div>
        <div className="col-md-2">{this.state.results.length} results found</div>
      </div>
    )
  } // render
} // SearchResults

class Search extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;

    this.onSearch = this.onSearch.bind(this);
  } // constructors

  onSearch(searchTerm) {
    this.driver.fetch(searchTerm)
      .then(results => this.results.setResults(results))
  } // onSearch

  render() {
    return (
      [
        <SearchBox onSearch={this.onSearch}/>,
        <SearchResults ref={results => this.results = results}/>
      ]
    )
  } // render
} // Search

export default Search;