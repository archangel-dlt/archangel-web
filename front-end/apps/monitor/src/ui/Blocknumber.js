import React, { Component } from 'react';

class Blocknumber extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blockNumber: 'Unknown',
      driver: props.driver
    }

    this.blockNumber();
  } // constructor

  async blockNumber() {
    const blockNo = await this.state.driver.currentBlockNumber()
    this.setState({
      blockNumber: blockNo
    });
    setTimeout(() => this.blockNumber(), 5000)
  } // blockNumber

  render() {
    return (
      <strong>Current Block: { this.state.blockNumber }</strong>
    )
  } // render
} // class Blocknumber

export default Blocknumber;
