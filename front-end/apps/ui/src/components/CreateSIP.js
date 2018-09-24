import React, { Fragment } from 'react';
import UploadBox from './upload/UploadBox';
import { SipInfo } from '@archangeldlt/web-common';
import CreatePackage from './upload/CreatePackage';

class CreateSIP extends CreatePackage {
  get type() { return 'SIP'; }

  preparePayload(timestamp, data, files) {
    const strippedFiles = files.map(file => {
      return {
        type: file.type,
        puid: file.puid,
        sha256_hash: file.sha256_hash,
        size: file.size,
        last_modified: file.last_modified
      }
    });

    const payload = {
      data,
      files: strippedFiles,
      timestamp
    };

    return payload;
  } // preparePayload

  renderForm() {
    return (
      <Fragment>
        <SipInfo key={`sip-${this.count}`} onData={data => this.onData(data)} readonly={this.isConfirming}/>
        <hr/>
        <UploadBox key={`files-${this.count}`} onFiles={files => this.onFiles(files)} readonly={this.isConfirming}/>
      </Fragment>
    )
  }
} // class Upload

export default CreateSIP;
