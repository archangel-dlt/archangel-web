import React, { Component } from 'react';

class Blocknumber extends Component {
  constructor(props) {
    super(props);

    this.state = { blockNumber: 'Unknown' };
  } // constructor

  get driver() { return this.props.driver; }

  componentDidMount() {
    this.blockNumber();
  } // componentDidMount

  async blockNumber() {
    const blockNo = await this.driver.currentBlockNumber()
    this.setState({ blockNumber: blockNo });
    setTimeout(() => this.blockNumber(), 5000);
  } // blockNumber

  render() {
    return (
      <strong>Current Block: { this.state.blockNumber }</strong>
    )
  } // render
} // class Blocknumber

export default Blocknumber;
