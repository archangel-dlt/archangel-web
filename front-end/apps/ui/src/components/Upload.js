import React, { Component } from 'react';
import UploadBox from './upload/UploadBox';
import SipInfo from './upload/SipInfo';

function CreateBtn({disabled, visible, onClick}) {
  return (
    <div className={'container-fluid ' + (!visible ? 'd-none' : '')}>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-primary offset-md-10 col-md-2"
          onClick={onClick}
        >Create SIP &raquo;&raquo;</button>
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
        >Upload SIP</button>
      </div>
    </div>
  );
} // CreateBtn


class Upload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 'creating',
      files: null,
      data: null
    }
  } // constructor

  onData(data) { this.updateCanCreate(data, this.state.files); }
  onFiles(files) { this.updateCanCreate(this.state.data, files); }
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
  onConfirm() { this.setState({ step: 'uploading' }); }

  get isCreating() { return this.state.step === 'canCreate' || this.state.step === 'creating'}
  get canCreate() { return this.state.step === 'canCreate'; }
  get isConfirming() { return this.state.step === 'canConfirm' || this.state.step === 'uploading' }
  get canConfirm() { return this.state.step === 'canConfirm'; }

  render() {
    return (
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

        <SipInfo onData={data => this.onData(data)} readonly={this.isConfirming}/>
        <hr/>
        <UploadBox onFiles={files => this.onFiles(files)} readonly={this.isConfirming}/>

        <CreateBtn
          disabled={!this.canCreate}
          visible={this.isCreating}
          onClick={() => this.onCreate()}/>
        <ConfirmBtn
          visible={this.canConfirm}
          onClick={() => this.onConfirm()}
          onBack={() => this.onBack()}/>
      </div>
    )
  } // render
} // class Upload

export default Upload;
