import React, { Component } from 'react';

import EthereumDriver from '../driver/Ethereum';
import GuardtimeDriver from '../driver/Guardtime';

class DriverPicker extends Component {
  constructor(props) {
    super(props);

    this.drivers = {
      'Guardtime': GuardtimeDriver(),
      'Ethereum': EthereumDriver()
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
      <div className="row">
        <label className="col-md-4 form-text">
          <span className="float-right">Driver</span>
        </label>
        <select className="col-md-8 form-control"
                onChange={event => this.onDriverChange(event.target.value)}>
          {
            Object.keys(this.drivers).map(
              label => { return (
                <option key={label} value={label}>{label}</option>
              ); }
            )
          }
        </select>
      </div>
    );
  } // render
} // class DriverPicker

export default DriverPicker;