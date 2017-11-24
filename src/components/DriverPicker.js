import React, { Component } from 'react';

import GuardtimeDriver from '../driver/Guardtime';

class DriverPicker extends Component {
  constructor(props) {
    super(props);

    this.drivers = {
      'Guardtime': GuardtimeDriver()
    };

    this.onNewDriver = props.onNewDriver;

    const initialDriver = Object.keys(this.drivers)[0];
    const driver = this.drivers[initialDriver];
    this.state = { driver: driver };
  } // constructor

  get currentDriver() { return this.state.driver; }

  onDriverChange(driverName) {
    const driver = this.drivers[driverName];
    this.setState({ driver: driver });
    this.onNewDriver(driver);
  } // onDriverChange

  render() {
    return (
      <label>Driver&nbsp;&nbsp;
        <select onChange={event => this.onDriverChange(event.target.value)}>
          {
            Object.keys(this.drivers).map(
              label => { return (
                <option key={label} value={label}>{label}</option>
              ); }
            )
          }
        </select>
      </label>
    );
  } // render
} // class DriverPicker

export default DriverPicker;