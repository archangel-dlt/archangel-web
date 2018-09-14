import React, { Component, Fragment } from 'react';
import { SipInfo, FileList } from '@archangeldlt/web-common';
import { DateTime } from "luxon";

function CreateBtn({disabled, visible, onClick}) {
  return (
    <div className={'container-fluid ' + (!visible ? 'd-none' : '')}>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-primary offset-md-10 col-md-2"
          onClick={onClick}
        >Create AIP &raquo;&raquo;</button>
      </div>
    </div>
  );
} // CreateBtn

function ConfirmBtn({disabled, visible, onClick, onBack}) {
  return (
    <div className={'container-fluid ' + (!visible ? 'd-none' : '')}>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-secondary col-md-2"
          onClick={onBack}
        >&laquo;&laquo; Back</button>
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-success offset-md-8 col-md-2"
          onClick={onClick}
        >Upload AIP</button>
      </div>
    </div>
  );
} // CreateBtn


class CreateAIP extends Component {
  constructor(props) {
    super(props);

    console.log('CreateAIP')
    console.log(props)
    this.state = {
      step: 'creating',
      files: props.sip.files,
      data: props.sip.data,
      count: 0
    }
  } // constructor

  reset() {
    this.setState({ count: this.count + 1 });
    this.updateCanCreate(null, null);
  } // reset
  get count() { return this.state.count; }

  onData(data) { this.updateCanCreate(data, this.state.files); }
  updateCanCreate(data, files) {
    const ready = (data !== null && files !== null)
    this.setState({
      data,
      files,
      step: ready ? 'canCreate' : 'creating'
    });
  } // updateCanCreate

  onCreate() { this.setState({ step: 'canConfirm' }); }
  onBack() { this.setState({ step: 'canCreate' }); }
  onConfirm() {
    this.setState({ step: 'uploading' });
    this.upload();
  } // onConfirm

  upload() {
    const timestamp = DateTime.utc().toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZ');
    const { data, files } = this.state;
    const strippedFiles = files.map(file => {
      return {
        type: file.type,
        puid: file.puid,
        sha256_hash: file.sha256_hash,
        size: file.size,
        last_modified: file.last_modified
      }
    })

    const payload = {
      data,
      files: strippedFiles,
      timestamp
    }

    this.props.driver.store(data.key, payload)
      .then(() => this.reset())
      .catch(err => { alert(err); this.setState({ step: 'canConfirm' }); });
  } // upload

  get isCreating() { return (this.state.step === 'canCreate') || (this.state.step === 'creating') }
  get canCreate() { return this.state.step === 'canCreate'; }
  get isConfirming() { return (this.state.step === 'canConfirm') || (this.state.step === 'uploading') }
  get canConfirm() { return this.state.step === 'canConfirm'; }

  render() {
    return (
      <Fragment>
        <div className='container-fluid'>
          <CreateBtn
            disabled={!this.canCreate}
            visible={this.isCreating}
            onClick={() => this.onCreate()}/>
          <ConfirmBtn
            disabled={!this.canConfirm}
            visible={this.isConfirming}
            onClick={() => this.onConfirm()}
            onBack={() => this.onBack()}/>

          <SipInfo initialData={this.state.data} readonly={this.isConfirming}/>
          <FileList files={this.state.files} readonly={true}/>

          <CreateBtn
            disabled={!this.canCreate}
            visible={this.isCreating}
            onClick={() => this.onCreate()}/>
          <ConfirmBtn
            visible={this.canConfirm}
            onClick={() => this.onConfirm()}
            onBack={() => this.onBack()}/>
        </div>
      </Fragment>
    )
  } // render
} // class CreateSIP.js

export default CreateAIP;
