import ArchangelEthereumDriver from '../driver/ArchangelEthereumDriver';
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

async function enableMetamaskAccounts(){
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
        // Request account access if needed
        await window.ethereum.enable();
    } catch (error) {
        console.log("Access denied to metamask accounts:", error);
    }
  }

  return window.web3.currentProvider;
}

function providers() {
  const p = []

  if (hasMetaMask)
    p.push({name: 'MetaMask', getProvider: enableMetamaskAccounts});
  if (hasMist)
    p.push({name: 'Mist', getProvider: () => window.web3.currentProvider});
  p.push({name: 'Localhost', getProvider: () => new Web3.providers.HttpProvider('http://localhost:8545')});
  p.push({name: hosted, getProvider: () => new Web3.providers.HttpProvider(hosted)});

  return p;
} // providers

class ArchangelProvider extends ArchangelEthereumDriver {
  constructor() {
    super(new Web3(providers()[0].getProvider()));
  } // constructor

  onProviderChange(key) {
    return this.setup(new Web3(providers().filter(p => p.name === key)[0].getProvider()))
  } // onProviderChange

  get metaMaskAvailable() { return hasMetaMask }
  get mistAvailable() { return hasMist }
  get providers() { return providers() }

  unwrapPayload(payload) {
    return ArchangelEthereumDriver.unwrapPayload(payload);
  }
} // class ArchangelProvider

function ArchangelDriver() {
  return new ArchangelProvider();
} // ArchangelDriver

export default ArchangelDriver
