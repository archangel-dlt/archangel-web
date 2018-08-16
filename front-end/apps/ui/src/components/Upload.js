import React, { Component } from 'react';
import UploadBox from './upload/UploadBox';
import SipInfo from './upload/SipInfo';

function CreateBtn({disabled}) {
  return (
    <div className='container-fluid'>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-primary offset-md-10 col-md-2"
        >Create SIP
        </button>
      </div>
    </div>
  );
} // CreateBtn

class Upload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null,
      data: null
    }
  }
  onData(data) {
    this.updateCanCreate(data, this.state.files);
  }
  onFiles(files) {
    this.updateCanCreate(this.state.data, files);
  } // onFiles

  updateCanCreate(data, files) {
    const canCreate = (data !== null && files !== null)
    this.setState({
      data,
      files,
      canCreate
    });
  } // updateCanCreate

  render() {
    return (
      <div className='container-fluid'>
        <CreateBtn disabled={!this.state.canCreate}/>
        <SipInfo onData={data => this.onData(data)}/>
        <hr/>
        <UploadBox onFiles={files => this.onFiles(files)}/>
        <CreateBtn disabled={!this.state.canCreate}/>
      </div>
    )
  } // render
} // class Upload

export default Upload;
