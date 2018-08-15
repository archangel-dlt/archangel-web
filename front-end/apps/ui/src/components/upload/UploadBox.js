import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import { Puid, prettysize } from '@archangeldlt/web-common';

class UploadBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableUpload: false,
      message: ''
    };

    this.onUpload = props.onUpload;

    this.handleFileDrop = this.handleFileDrop.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // constructor

  handleFileDrop(files) {
    this.setState({
      'disableUpload': true,
      'message': 'Sending file to DROID for characterization ...',
      'payload': null
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

    this.setState({
      'payload': json
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
    if (!this.state.payload)
      return

    return ([
      <div className="col-md-3"/>,
      <div className="row col-md-8 form-control">
        {
          this.state.payload.map(item => (
            <div id={item.name} className="row col-md-12 ">
              <span className="col-md-8">{ item.name }</span>
              <span className="col-md-2"><Puid fmt={ item.puid }/></span>
              <span className="col-md-2">{ prettysize(item.size, true) }</span>
            </div>
          ))
        }
      </div>
    ])
  } // renderFileInfo

  render() {
    return (
      <div className='container-fluid'>
        <form className="form-group row" onSubmit={this.handleSubmit}>
          <div className="row col-md-12">
          <span className="form-text col-md-2">
            File
          </span>
            <Dropzone onDrop={this.handleFileDrop}
                      disabled={this.state.disableUpload}
                      className="form-control col-md-10">
              Drop a file here, or click to select a file
            </Dropzone>
          </div>

          <div className="row col-md-12">
            <span className="col-md-12 text-center"><strong>{this.state.message}</strong></span>
          </div>

          { this.renderFileInfo() }

          <div className="row col-md-12">
          <span className="form-text col-md-2">
            Comment
          </span>
            <textarea
              className="form-control col-md-10"
              value={this.state.comment}
              onChange={this.handleCommentChange}
            />
          </div>
          <div className="row col-md-12">
            <div className="col-md-10"/>
            <button
              type="submit"
              className="btn btn-primary col-md-2"
              disabled={!(this.state.payload)}>Upload
            </button>
          </div>
        </form>
      </div>
    )
  } // render
} // class UploadBox

export default UploadBox;