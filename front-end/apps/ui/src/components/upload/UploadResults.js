import React, { Component } from 'react';

class UploadResults extends Component {
  constructor(props) {
    super(props);
    this.state = {messages: []}
  } // constructor

  clear() {
    this.setState({
      messages: []
    })
  } // clear

  message(msg) {
    let messages = this.state.messages;
    while (messages.length >= 5)
      messages.shift();

    messages.push(msg);
    this.setState({
      messages: messages
    });
  } // uploadComplete

  error(msg) {
    this.message(`${msg}`);
  } // error

  render() {
    return null;
    /*
    const {messages} = this.state;

    if (messages.length === 0)
      return (<div/>)

    return UploadResults.renderResults(messages);
    */
  } // render

  static renderResults(messages) {
    return (
      <div className='container-fluid'>
        {
          messages.map((msg, i) => (
            <div className='row' key={i}>
              <div className='col-md-12'>{msg}</div>
            </div>
          ))
        }
      </div>
    )
  } // renderResults
} // UploadResults

export default UploadResults;