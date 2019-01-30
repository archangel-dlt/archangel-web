import React, { Fragment } from 'react';
import UploadBox from './upload/UploadBox';
import { SipInfo } from '@archangeldlt/web-common';
import CreatePackage from './upload/CreatePackage';

class CreateSIP extends CreatePackage {
  get type() { return 'SIP'; }

  onIncludeFilenames(includeFilenames) {
    this.setState({
      includeFilenames: includeFilenames
    })
  } // onIncludeFilenames

  preparePayload(timestamp, data, files) {
    const strippedFiles = files.map(file => {
      return {
        path: file.path,
        name: file.name,
        type: file.type,
        puid: file.puid,
        sha256_hash: file.sha256_hash,
        size: file.size,
        last_modified: file.last_modified
      }
    });

    if (!this.state.includeFilenames) {
      strippedFiles.forEach(file => {
        delete file.path
        delete file.name
      })
    }

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
        <UploadBox key={`files-${this.count}`}
                   onFiles={files => this.onFiles(files)}
                   onIncludeFilenames={includeFilenames => this.onIncludeFilenames(includeFilenames)}
                   readonly={this.isConfirming}/>
      </Fragment>
    )
  }
} // class Upload

export default CreateSIP;
