import React, { Fragment } from 'react';
import { AipInfo, FileList } from '@archangeldlt/web-common';
import CreatePackage from './upload/CreatePackage';

class CreateAIP extends CreatePackage {
  get type() { return 'AIP'; }

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
        <FileList files={this.state.files} readonly={true}/>
      </Fragment>
    )
  } // renderForm
} // class CreateAIP

export default CreateAIP;
