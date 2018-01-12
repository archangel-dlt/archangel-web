import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import { DateTime } from 'luxon';

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
      'message': 'Sending file to DROID for characterization ...'
    })

    superagent
      .post('/upload')
      .attach('candidate', files[0])
      .then(json => this.fileCharacterised(json))
      .catch(err => this.fileCharacterisationFailed(err))
  } // handleFileDrop

  fileCharacterised(json) {
    this.setState({
      'disableUpload': false,
      'message': ''
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
    if (this.state.id && this.state.comment)
      this.onUpload(this.state.id, this.state.comment);
    event.preventDefault();
  } // handleSubmit

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
            disabled={!(this.state.id && this.state.comment)}>Upload
          </button>
        </div>
      </form>
    )
  } // render
} // class UploadBox

class UploadResults extends Component {
  constructor(props) {
    super(props);
    this.state = {id: null, errors: null}
  } // constructor

  clear() {
    this.setState({
      id: null,
      errors: null
    })
  } // clear

  uploadComplete(msg) {
    this.setState({
      msg: msg
    });
  } // uploadComplete

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {msg, errors} = this.state;

    if (!msg && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(msg);
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

  renderResults(msg) {
    return (
      <div>
        <div className="row">
          <hr className="col-md-12"/>
        </div>
        <div className="row">
          <div className="col-md-12">{ msg }</div>
        </div>
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

  onUpload(id, comment) {
    this.resultsBox.clear();
    this.driver.store(id, comment, DateTime.local().toISO())
      .then(msg => this.resultsBox.uploadComplete(msg))
      .catch(error => this.resultsBox.setErrors(error));
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