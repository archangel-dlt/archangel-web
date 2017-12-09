import React from 'react';
import Ethereum from '../driver/Ethereum';

class ReactEthereum extends Ethereum {
  ///////////////////////////////
  render() {
    return <strong>Hey there</strong>
  } // render
} // class ReactEthereum

function createEthereumDriver() {
  return new Ethereum();
} // createEthereumDriver

export default createEthereumDriver;