import React, { Component } from 'react'

class Field extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.initialValue || ''
    }
  } // constructor

  handleChange(event) {
    this.setState({value: event.target.value});
    if (this.props.onValue)
      this.props.onValue(event.target.value);
  } // handleChange

  render() {
    return (
      <div className={this.props.className}>
        <div className='container-fluid'>
          <div className='row'>
            {
              this.props.title && <label className='col-md-2'>{this.props.title}</label>
            }
            <input
              type='text'
              className={`form-control ${this.props.length === 'small' ? 'col-md-4' : 'col-md'}`}
              placeholder={this.props.placeholder}
              value={this.state.value}
              onChange={event => this.handleChange(event)}/>
          </div>
        </div>
      </div>
    )
  } // render
} // class Field

export default Field;