import React from 'react';
import Modal from 'react-modal';

function DialogBox(props) {
  if (!props.show)
    return (<div/>);

  const canOK = (props.canOK !== undefined) ? props.canOK : () => true;

  const onClose = props.onClose;
  const onOK = props.onOK;

  const labelOK = (props.labelOK !== undefined) ? props.labelOK : 'OK';

  return (
      <Modal
          isOpen={true}
          style={{
            content: {
              top         : '10%',
              left        : '50%',
              right       : 'auto',
              bottom      : 'auto',
              minWidth    : '600px',
              marginRight : '-50%',
              transform   : 'translate(-50%, -10%)'            }
          }}>
        <div className="modal-header">
          <div><strong>{props.title}</strong></div>
        </div>

        {props.children}

        <hr/>
        <div className="row">
          <div className="col-lg-6">
            <button className="btn btn-block btn-secondary" onClick={onClose}>Cancel</button>
          </div>
          <div className="col-lg-6">
            <button
              disabled={!canOK()}
              className={canOK() ? 'btn btn-primary btn-block active' : 'btn btn-primary btn-block disabled'}
              onClick={onOK}>{labelOK}</button>
          </div>
        </div>
      </Modal>
  );
} // DialogBox

function DialogRow(props) {
  return (
    <div className="row">
      <div className="col-lg-6">{props.title}</div>
      <div className="col-lg-6">{props.children}</div>
    </div>
  );
} // DialogRow

export { DialogBox, DialogRow };
