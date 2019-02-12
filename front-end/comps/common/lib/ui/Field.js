import React, { Component } from 'react'

class Field extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.initialValue || ''
    }
  } // constructor

  setValue(value) {
    this.handleChange({
      target: {
        value: value
      }
    })
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    if (this.props.onValue)
      this.props.onValue(event.target.value);
  } // handleChange

  handleKeyPress(event) {
    if (event.key === 'Enter' && this.props.onEnter)
      this.props.onEnter();
  }

  render() {
    return (
      <div className={`container-fluid ${this.props.className}`}>
        <div className='row'>
          {
            this.props.title && <label className='col-md-2'>{this.props.title}</label>
          }
          <input
            type='text'
            className={`form-control ${this.props.size === 'small' ? 'col-md-4' : 'col-md'}`}
            placeholder={this.props.placeholder}
            value={this.state.value}
            disabled={this.props.disabled}
            onChange={event => this.handleChange(event)}
            onKeyPress={event => this.handleKeyPress(event)}/>
        </div>
      </div>
    )
  } // render
} // class Field

export default Field;
