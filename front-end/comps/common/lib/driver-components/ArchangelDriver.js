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

class ArchangelProvider extends ArchangelEthereumDriver {
  constructor() {
    super(new Web3(providers()[0].provider));
  } // constructor

  onProviderChange(key) {
    const provider = providers().filter(p => p.name === key)[0].provider;
    return this.setup(new Web3(provider))
  } // onProviderChange

  get metaMaskAvailable() { return hasMetaMask }
  get mistAvailable() { return hasMist }
  get providers() { return providers() }
} // class ArchangelProvider

function ArchangelDriver() {
  return new ArchangelProvider();
} // ArchangelDriver

export default ArchangelDriver
