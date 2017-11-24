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
            className="form-control col-md-8"
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
            className="form-control col-md-8"
            value={this.state.payload}
            onChange={this.handlePayloadChange}
            />
        </div>
        <div className="row col-md-12">
          <div className="col-md-10"/>
          <button
            type="submit"
            className="btn btn-primary col-md-2"
            onClick={this.handleSubmit}>Upload
          </button>
        </div>
      </form>
    )
  } // render
} // class UploadBox

class Upload extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;

    this.onUpload = this.onUpload.bind(this);
  } // constructor

  onUpload(id, payload) {
    this.driver.store(id, payload, DateTime.local().toISO())
      .then(results => {
        console.log(results);
      })
  }

  render() {
    return (
      <div>
        <UploadBox onUpload={this.onUpload}/>
      </div>
    )
  } // render
} // class Upload

export default Upload;