import React, { Component } from 'react';
import { DateTime } from 'luxon';

class UploadBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      payload: ''
    };

    this.onUpload = props.onUpload;

    this.handleIDChange = (event) => this.handleUpdate('id', event.target.value);
    this.handlePayloadChange = (event) => this.handleUpdate('payload', event.target.value);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // constructor

  handleUpdate(key, value) {
    this.setState({
      [key]: value
    });
  } // update

  handleSubmit(event) {
    if (this.state.id && this.state.payload)
      this.onUpload(this.state.id, this.state.payload);
    event.preventDefault();
  } // handleSubmit

  render() {
    return (
      <form className="form-group row" onSubmit={this.handleSubmit}>
        <div className="row col-md-12">
          <span
            className="form-text col-md-2">ID
          </span>
          <input
            type="text"
            className="form-control col-md-10"
            placeholder="Archangel ID"
            value={this.state.id}
            onChange={this.handleIDChange}
            />
        </div>
        <div className="row col-md-12">
          <span className="form-text col-md-2">
            Payload
          </span>
          <textarea
            className="form-control col-md-10"
            value={this.state.payload}
            onChange={this.handlePayloadChange}
            />
        </div>
        <div className="row col-md-12">
          <div className="col-md-10"/>
          <button
            type="submit"
            className="btn btn-primary col-md-2"
            disabled={!(this.state.id && this.state.payload)}>Upload
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

  uploadComplete(id) {
    this.setState({
      id: id
    });
  } // setResults

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {id, errors} = this.state;

    if (!id && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(id);
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

  renderResults(id) {
    return (
      <div>
        <div className="row">
          <hr className="col-md-12"/>
        </div>
        <div className="row">
          <div className="col-md-12">
            {id} uploaded.
          </div>
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

  onUpload(id, payload) {
    this.resultsBox.clear();
    this.driver.store(id, payload, DateTime.local().toISO())
      .then(() => this.resultsBox.uploadComplete(id))
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