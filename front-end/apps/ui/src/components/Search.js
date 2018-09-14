import React, { PureComponent } from 'react';
import SearchBox from './search/SearchBox';
import SearchResults from './search/SearchResults';

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
        <SearchResults
          ref={resultsBox => this.resultsBox = resultsBox}
          canWrite={this.props.canWrite}
          onCreateAIP={sip => this.props.onCreateAIP(sip)}/>
      </div>
    );
  } // render
} // Search

export default Search;
