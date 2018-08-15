import React, { Component } from 'react';
import UploadBox from './upload/UploadBox';
import UploadResults from './upload/UploadResults';
import { DateTime } from 'luxon';

class Upload extends Component {
  constructor(props) {
    super(props);

    this.onUpload = this.onUpload.bind(this);
  } // constructor

  onUpload(payloads, comment) {
    const timestamp = DateTime.utc().toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZ');

    payloads.forEach(item => {
      item.comment = comment;
      item.timestamp = timestamp;
    });

    this.props.driver.store(payloads, this.resultsBox);
  } // onUpload

  render() {
    return (
      <div>
        <UploadBox onUpload={this.onUpload}/>
        <UploadResults ref={resultsBox => this.resultsBox = resultsBox}/>
      </div>
    )
  } // render
} // class Upload

export default Upload;
