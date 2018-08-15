import React, { Component } from 'react';
import UploadBox from './upload/UploadBox';
import SipInfo from './upload/SipInfo';

class Upload extends Component {
  render() {
    return (
      <div className='container-fluid'>
        <SipInfo ref={sipInfo => this.sipInfo = sipInfo}/>
        <hr/>
        <UploadBox onUpload={this.onUpload}/>

        <div className="row">
          <button
            type="submit"
            className="btn btn-primary offset-md-10 col-md-2"
            >Create SIP
          </button>
        </div>
      </div>
    )
  } // render
} // class Upload

export default Upload;
