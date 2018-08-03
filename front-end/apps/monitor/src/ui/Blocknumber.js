import React, { Component } from 'react';

class Blocknumber extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blockNumber: 'Unknown',
      driver: props.driver
    }
  } // constructor

  async blockNumber() {
    const blockNo = await this.state.driver.currentBlockNumber()
    this.setState({
      blockNumber: blockNo
    });
  } // blockNumber

  render() {
    setTimeout(() => this.blockNumber(), 5000)
    const blockNumber = this.state.blockNumber

    return (
      <strong>Current Block: { this.state.blockNumber }</strong>
    )
  } // render
} // class Blocknumber

export default Blocknumber;
