import React from 'react';
import Ethereum from '../driver/Ethereum';
import Web3 from "web3";

const hasMetaMask = (typeof window.web3 !== 'undefined')

function providers() {
  const p = []

  if (hasMetaMask)
    p.push({name: 'MetaMask', provider: window.web3.currentProvider});
  p.push({name: 'Localhost', provider: new Web3.providers.HttpProvider('http://localhost:8545')});

  return p;
} // providers

class ReactEthereum extends Ethereum {
  constructor() {
    super(new Web3(providers()[0].provider));
  } // constructor

  onProviderChange(key) {
    const provider = providers().filter(p => p.name === key)[0].provider;
    this.setup(new Web3(provider))
  } // onProviderChange

  ///////////////////////////////
  render() {
    return (
      <div className="row col-md-12">
        <label className="col-md-4 form-text">
          <span className="float-right">Ethereum<br/>Provider</span>
        </label>
        <select className="col-md-8 form-control"
                onChange={event => this.onProviderChange(event.target.value)}>
          {
            providers().map(
              p => <option key={p.name} value={p.name}>{p.name}</option>
            )
          }
        </select>
        <br/>
      </div>
    );
  } // render
} // class ReactEthereum

function createEthereumDriver() {
  return new ReactEthereum();
} // createEthereumDriver

export default createEthereumDriver;