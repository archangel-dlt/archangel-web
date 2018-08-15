import React, { Component, PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import { FileSizeFormatter, PuidFormatter } from '@archangeldlt/web-common';
import ReactDataGrid from 'react-data-grid';
import PropTypes from 'prop-types';

class PuidLink extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired
  };

  render() {
    return (<PuidFormatter value={ this.props.value }/>);
  }
}

class UploadBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableUpload: false,
      message: '',
      payload: [ ]
    };

    this.onUpload = props.onUpload;

    this.handleFileDrop = this.handleFileDrop.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // constructor

  handleFileDrop(files) {
    this.setState({
      'disableUpload': true,
      'message': 'Sending file to DROID for characterization ...'
    })

    const file = files[0]

    superagent
      .post('upload')
      .field('lastModified', file.lastModified)
      .attach('candidate', file)
      .then(response => this.fileCharacterised(response.body))
      .catch(err => this.fileCharacterisationFailed(err))
  } // handleFileDrop

  fileCharacterised(droidInfo) {
    this.setState({
      'disableUpload': false,
      'message': ''
    })

    const json = droidInfo.map(info => {
      const j = {
        uri: info.URI,
        name: info.NAME,
        puid: info.PUID,
        sha256_hash: info.SHA256_HASH,
        size: info.SIZE,
        type: info.TYPE
      };

      if (info.LAST_MODIFIED)
        j.last_modified = info.LAST_MODIFIED;
      if (info.PARENT_ID)
        j.parent_sha256_hash = info.PARENT_SHA256_HASH;

      return j;
    })

    const payload = this.state.payload;
    payload.push(...json);
    this.setState({
      'payload': payload
    })
  } // fileCharacterised

  fileCharacterisationFailed(err) {
    this.setState({
      'disableUpload': false,
      'message': `File characterisation failed : ${err}`
    })
  } // fileCharacterisationFailed

  handleCommentChange(event) {
    this.setState({
      'comment': event.target.value
    });
  } // update

  handleSubmit(event) {
    if (this.state.payload)
      this.onUpload(this.state.payload, this.state.comment);
    event.preventDefault();
  } // handleSubmit

  renderFileInfo() {
    const payload = this.state.payload;
    if (!payload || !payload.length)
      return

    const columns = [
      { key: 'uri', name: 'Path', resizable: true },
      { key: 'name', name: 'File name', resizable: true },
      { key: 'type', name: 'Type', resizable: true },
      { key: 'puid', name: 'Puid', resizable: true, formatter: PuidFormatter },
      { key: 'sha256_hash', name: 'Hash', resizable: true },
      { key: 'size', name: 'Size', resizable: true, formatter: FileSizeFormatter },
      { key: 'last_modified', name: 'Last Modified', resizable: true }
    ];

    return (
      <ReactDataGrid
        columns={columns}
        rowGetter={i => payload[i]}
        rowsCount={payload.length}
        minHeight={200} />
    );
  } // renderFileInfo

  render() {
    return (
      <form className="form-group container-fluid" onSubmit={this.handleSubmit}>
        <div className="row">
          { this.renderFileInfo() }

          <span className="form-text col-md-2">
            File
          </span>
          <Dropzone onDrop={this.handleFileDrop}
                    disabled={this.state.disableUpload}
                    className="form-control col-md-10">
            Drop a file here, or click to select a file
          </Dropzone>
        </div>

        <div className="row">
          <span className="col-md-12 text-center"><strong>{this.state.message}</strong></span>
        </div>
      </form>
    )
  } // render
} // class UploadBox

export default UploadBox;