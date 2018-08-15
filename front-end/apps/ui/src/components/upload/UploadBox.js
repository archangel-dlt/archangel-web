import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import { FileSizeFormatter, PuidFormatter } from '@archangeldlt/web-common';
import ReactDataGrid from 'react-data-grid';

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

  async handleFileDrop(files) {
    for(const file of files) {
      this.setState({
        'disableUpload': true,
        'message': `Sending '${file.name}' to DROID for characterization ...`
      })

      try {
        const response = await superagent
          .post('upload')
          .field('lastModified', file.lastModified)
          .attach('candidate', file)

        this.fileCharacterised(response.body);
      } catch (err) {
        this.fileCharacterisationFailed(err);
      }
    } // for ...
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
          <FileInfo payload={this.state.payload}/>
        </div>
        <div className="row">
          <div className="col-md-10">{this.state.message}</div>
          <Dropzone onDrop={this.handleFileDrop}
                    disabled={this.state.disableUpload}
                    className="form-control btn btn-secondary col-md-2">
            Add Files
          </Dropzone>
        </div>
      </form>
    )
  } // render
} // class UploadBox

function FileInfo({payload}) {
  if (!payload || !payload.length)
    return null;

  const columns = [
    { key: 'uri', name: 'Path', resizable: true },
    { key: 'name', name: 'File name', resizable: true },
    { key: 'type', name: 'Type', resizable: true },
    { key: 'puid', name: 'Puid', resizable: true, formatter: PuidFormatter },
    { key: 'sha256_hash', name: 'Hash', resizable: true },
    { key: 'size', name: 'Size', resizable: true, formatter: FileSizeFormatter },
    { key: 'last_modified', name: 'Last Modified', resizable: true }
  ];

  const size = payload.length > 5 ? 500 : 200;

  return (
    <ReactDataGrid
      columns={columns}
      rowGetter={i => payload[i]}
      rowsCount={payload.length}
      minHeight={size} />
  );
} // renderFileInfo

export default UploadBox;