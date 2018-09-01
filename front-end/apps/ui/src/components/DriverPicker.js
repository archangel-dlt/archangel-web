import React, { Component } from 'react';

import { ReactEthereum} from '@archangeldlt/web-common';

class DriverPicker extends Component {
  constructor(props) {
    super(props);

    this.drivers = { 'Ethereum': ReactEthereum() };

    this.onNewDriver = props.onNewDriver;

    const initialDriver = Object.keys(this.drivers)[0];
    const driver = this.drivers[initialDriver];
    this.state = {
      driver: driver,
      settled: 0
    };

    this.waitToSettle();
  } // constructor

  waitToSettle() { setTimeout(() => this.settled(), 1000); }
  settled() { this.setState({ settled: this.state.settled + 1 }); }

  get currentDriver() { return this.state.driver; }

  onDriverChange(driverName) {
    const driver = this.drivers[driverName];
    this.setState({ driver: driver });
    this.onNewDriver(driver);
    this.waitToSettle();
  } // onDriverChange

  driverPickerUI() {
    if (Object.keys(this.drivers).length <= 1)
      return null;
   return (
      <div className="row col-md-12">
        <label className="col-md-4 form-text">
          <span className="float-right">Driver</span>
        </label>
        <select className="col-md-8 form-control"
                onChange={event => this.onDriverChange(event.target.value)}>
          {
            Object.keys(this.drivers).map(
              label => <option key={label} value={label}>{label}</option>
            )
          }
        </select>
      </div>
    )
  } // driverPickerUI

  driverUI() {
    const driver = this.state.driver;
    if (!driver)
      return null;

    return driver.render ? driver.render() : null;
  } // driverUI

  render() {
    return (
      <div className="row">
        { this.driverPickerUI() }
        { this.driverUI() }
      </div>
    );
  } // render
} // class DriverPicker

export default DriverPicker;
