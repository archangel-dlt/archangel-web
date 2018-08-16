import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import superagent from 'superagent';
import { FileList } from '@archangeldlt/web-common';

class UploadBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableUpload: false,
      message: '',
      payload: [ ]
    };
  } // constructor

  get onFiles() { return this.props.onFiles; }
  get files() { return this.state.payload; }

  async handleFileDrop(files) {
    this.onFiles(null);
    this.disableUpload();

    for(const file of files) {
      this.message(`Sending '${file.name}' to DROID for characterization ...`);

      try {
        const response = await superagent
          .post('upload')
          .field('lastModified', file.lastModified)
          .attach('candidate', file)

        this.fileCharacterised(response.body);
      } catch (err) {
        this.message(`File characterisation failed : ${err}`);
      }
    } // for ...

    this.onFiles(this.state.payload);
    this.enableUpload();
    this.resetMessage();
  } // handleFileDrop

  disableUpload() { this.setState({'disableUpload': true}); }
  enableUpload() { this.setState({'disableUpload': false}); }

  message(msg) { this.setState({'message': msg}); }
  resetMessage() { this.message(''); }

  fileCharacterised(droidInfo) {
    const json = droidInfo.map(info => {
      const j = {
        uri: info.URI,
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

    const payload = this.state.payload;
    payload.push(...json);
    this.setState({
      'payload': payload
    })
  } // fileCharacterised

  render() {
    return (
      <div className="container-fluid">
        <div className={"row " + (this.props.readonly ? 'd-none' : '')}>
          <Dropzone onDrop={files => this.handleFileDrop(files)}
                    disabled={this.state.disableUpload}
                    disabledClassName="disabled"
                    className="form-control btn btn-secondary col-md-2">
            Add Files
          </Dropzone>
          <div className="col-md-6 offset-md-4">{this.state.message}</div>
        </div>
        <div className="row">
          <FileList files={this.state.payload} readonly={this.props.readonly}/>
        </div>
      </div>
    )
  } // render
} // class UploadBox

export default UploadBox;