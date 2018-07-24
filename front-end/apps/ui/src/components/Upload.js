import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import prettysize from '../lib/prettysize';
import {Puid} from '@archangeldlt/web-common';
import {DateTime} from "luxon";

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
    )
  } // render
} // class UploadBox

class UploadResults extends Component {
  constructor(props) {
    super(props);
    this.state = {messages: []}
  } // constructor

  clear() {
    this.setState({
      messages: []
    })
  } // clear

  message(msg) {
    let messages = this.state.messages;
    while (messages.length >= 5)
      messages.shift();

    messages.push(msg);
    this.setState({
      messages: messages
    });
  } // uploadComplete

  error(msg) {
    this.message(`${msg}`);
  } // error

  render() {
    const {messages} = this.state;

    if (messages.length === 0)
      return (<div/>)

    return UploadResults.renderResults(messages);
  } // render

  static renderResults(messages) {
    return (
      <div>
        {
          messages.map(msg => (
            <div className="row">
              <div className="col-md-12">{msg}</div>
            </div>
          ))
        }
      </div>
    )
  } // renderResults
} // UploadResults


class Upload extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;

    this.onUpload = this.onUpload.bind(this);
  } // constructor

  componentWillReceiveProps(props) {
    this.driver = props.driver;
  } // componentWillReceiveProps

  onUpload(payloads, comment) {
    const timestamp = DateTime.utc().toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZ');

    payloads.forEach(item => {
      item.comment = comment;
      item.timestamp = timestamp;
    });

    this.driver.store(payloads, this.resultsBox);
  } // onUpload

  /*uploadItem(payload, index) {
    if (index === payload.length)
      return;

    const item = payload[index];
    this.resultsBox.message(`Submitting ${item.name}`)
    this.driver.store(item)
      .then(msg => {
        this.resultsBox.message(msg);
        this.uploadItem(payload, index+1)
      })
      .catch(error => {
        this.resultsBox.error(error);
        this.uploadItem(payload, index+1)
      });
  } // uploadItem
  */

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
