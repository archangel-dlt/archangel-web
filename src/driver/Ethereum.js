import Web3 from 'web3';
import ArchangelABI from './ethereum/Archangel';
import { DateTime } from 'luxon';

const ArchangelAddress = '0x40aa476f8ae7105d9094e8293b633273c085a3d5';
const NullId = '0x0000000000000000000000000000000000000000000000000000000000000000';

function missingMetaMask() {
  alert('The Ethereum Driver requires MetaMask.');
  return null;
} // missingMetaMask

let web3_;
function web3() {
  if (web3_)
    return web3_;
  web3_ = new Web3(window.web3.currentProvider);
  return web3_;
} // web3

function createContract() {
  const contractClass = web3().eth.contract(ArchangelABI);
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
  static get name() { return "Ethereum"; }

  async store(id, payload, timestamp) {
    const slug = {
      id: id,
      payload: payload,
      timestamp: timestamp
    };
    return this.eth_store(id, slug);
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
  eth_store(id, slug) {
    const contract = archangelContract();
    const slugStr = JSON.stringify(slug);

    return new Promise((resolve, reject) => {
      const onCommitted = (tx, timeout) => {
        web3().eth.getTransactionReceipt(tx, (err, result) => {
          if (err)
            return reject(err);

          if (result)
            return resolve({
              tx: tx,
              receipt: result
            });

          const diff = timeout.diff(DateTime.local(), 'seconds').values.seconds;
          if (diff <= 0)
            return reject(new Error(`Transaction ${tx} wasn't processed within ${this.txTimeout} seconds.`));

          setTimeout(() => onCommitted(tx, timeout), 1000);
        });
      }; // onCommitted

      const timeout = DateTime.local().plus({seconds: 60});
      contract.store(id, slugStr,
        { from: web3().eth.accounts[0].toLowerCase() },
        (err, tx) => {
          if (err)
            return reject(err);
          // transaction(tx);
          onCommitted(tx, timeout);
        });
    })
  } // eth_store

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