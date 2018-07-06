import React from 'react';
import Ethereum from '../driver/Ethereum';
import Web3 from 'web3';

const hasMetaMask = (typeof window.web3 !== 'undefined') &&
  ((window.web3.currentProvider.constructor.name.startsWith('Metamask') ||
    (window.web3.currentProvider.constructor.toString().indexOf('MetaMask') !== -1)));
const hasMist = (typeof window.web3 !== 'undefined') &&
  (window.web3.currentProvider.constructor.name.startsWith('EthereumProvider'));

const pathPrefix = (() => {
  let path = window.location.pathname.replace('/index.html', '')
  path = path.substring(0, path.lastIndexOf('/'))
  return path.length === 1 ? path : `${path}/`
})()
const hosted = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${pathPrefix}geth`

function providers() {
  const p = []

  if (hasMetaMask)
    p.push({name: 'MetaMask', provider: window.web3.currentProvider});
  if (hasMist)
    p.push({name: 'Mist', provider: window.web3.currentProvider});
  p.push({name: 'Localhost', provider: new Web3.providers.HttpProvider('http://localhost:8545')});
  p.push({name: hosted, provider: new Web3.providers.HttpProvider(hosted)});

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
      <React.Fragment>
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
        </div>
        { (!hasMetaMask && !hasMist) &&
        <sup className="col-md-12"><span className="float-right">Install MetaMask plugin for
                <a target='_blank' rel="noopener noreferrer" href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'>Firefox</a> and
                <a target='_blank' rel="noopener noreferrer" href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'>Chrome</a></span></sup>
        }
      </React.Fragment>
    );
  } // render
} // class ReactEthereum

function createEthereumDriver() {
  return new ReactEthereum();
} // createEthereumDriver

export default createEthereumDriver;
