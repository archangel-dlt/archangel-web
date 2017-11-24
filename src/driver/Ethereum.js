import Web3 from 'web3';
import ArchangelABI from './ethereum/Archangel';

const ArchangelAddress = '0x40aa476f8ae7105d9094e8293b633273c085a3d5';
const NullId = '0x0000000000000000000000000000000000000000000000000000000000000000';

function missingMetaMask() {
  alert('The Ethereum Driver requires MetaMask.');
  return null;
} // missingMetaMask

function createContract() {
  const web3 = new Web3(window.web3.currentProvider);
  const contractClass = web3.eth.contract(ArchangelABI);
  return contractClass.at(ArchangelAddress);
} // archangelContract

let contractInst = null;

function archangelContract() {
  if (contractInst)
    return contractInst;

  if (typeof window.web3 !== 'undefined')
    contractInst = createContract();
  else
    missingMetaMask();

  return contractInst;
} // archangelContract

class Ethereum {
  async store(id, payload, timestamp) {
    alert("Ethereum.store not yet implemented");
  } // store

  async fetch(id) {
    let [payload, prev] = await this.eth_fetch(id);
    if (!payload)
      return [];

    const results = [ JSON.parse(payload) ];

    while (prev !== NullId) {
      [payload, prev] = await this.eth_fetchPrevious(prev);
      results.push(JSON.parse(payload));
    }

    return results;
  } // fetch

  ////////////////////////
  eth_fetch(id) {
    return this.eth_call_fetch('fetch', id);
  } // eth_fetch

  eth_fetchPrevious(id) {
    return this.eth_call_fetch('fetchPrevious', id);
  } // eth_fetch

  eth_call_fetch(methodName, id) {
    const contract = archangelContract();
    return new Promise((resolve, reject) => {
      contract[methodName].call(id,
        (err, results) => {
          if (err)
            return reject(err);
          resolve(results);
        });
    }); // eth_fetch
  } // eth_call_fetch
} // class Ethereum

function createEthereumDriver() {
  return new Ethereum();
} // createEthereumDriver

export default createEthereumDriver;