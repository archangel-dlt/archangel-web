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
  }

  setResults(results) {
    this.setState({results: results})
  } // setResults

  render() {
    const results = this.state.results;

    if (!results)
      return (<div/>)

    return (
      <div>
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
  } // render
} // SearchResults

class Search extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;

    this.onSearch = this.onSearch.bind(this);
  } // constructors

  componentWillReceiveProps(props) {
    this.driver = props.driver;
  } // componentWillReceiveProps

  onSearch(searchTerm) {
    this.driver.fetch(searchTerm)
      .then(results => {
        this.results.setResults(results)
      })
  } // onSearch

  render() {
    return (
      <div>
        <SearchBox onSearch={this.onSearch}/>
        <SearchResults ref={results => this.results = results}/>
      </div>
    )
  } // render
} // Search

export default Search;