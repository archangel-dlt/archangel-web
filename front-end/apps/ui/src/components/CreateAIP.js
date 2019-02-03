import React, { Fragment } from 'react';
import { AipInfo, FileList } from '@archangeldlt/web-common';
import CreatePackage from './upload/CreatePackage';

class CreateAIP extends CreatePackage {
  constructor(props) {
    super(props, props.sip.files, props.sip.data);
    this.hasFilenames = props.sip.hasFilenames
    this.hasUuid = props.sip.hasUuid
  } // constructor

  get type() { return 'AIP'; }

  reset() {
    this.setState({ count: this.count + 1 });
    this.updateCanCreate(null, null);
    if (this.props.onSubmit)
      this.props.onSubmit();
  } // reset

  get count() { return this.state.count; }

  preparePayload(timestamp, data, files) {
    const payload = {
      data,
      files,
      timestamp
    }

    return payload;
  } // preparePayload

  renderForm() {
    return (
      <Fragment>
        <AipInfo initialData={this.state.data} readonly={this.isConfirming} onData={data => this.onData(data)}/>
        <FileList files={this.state.files} showPath={this.hasFilenames} showUuid={this.hasUuid}/>
      </Fragment>
    )
  } // renderForm
} // class CreateAIP

export default CreateAIP;
