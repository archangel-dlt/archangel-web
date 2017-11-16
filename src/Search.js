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
          className="form-control col-md-6"
          placeholder="Search Archangel"
          value={this.state.value}
          onChange={this.handleChange}/>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={this.handleSubmit}>Search
        </button>
      </form>
    )
  } // react
} // SearchBox

class Search extends Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
  } // constructors

  onSearch(searchTerm) {
    alert(`Woot - ${searchTerm}`);
  }

  render() {
    return (
      [
        <SearchBox onSearch={this.onSearch}/>,
        <p>Search results go here</p>
      ]
    )
  } // render
} // Search

export default Search;