import Web3 from 'web3';
import ArchangelABI from './ethereum/Archangel';
import { DateTime } from 'luxon';

const ArchangelAddress = '0x3507dCef171f6B7F36c56e35013d0785B150584F'.toLowerCase();
const FromBlock = 1378500;
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
  //web3_ = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  return web3_;
} // web3

function createContract() {
  const contractClass = web3().eth.contract(ArchangelABI);
  return contractClass.at(ArchangelAddress);
} // archangelContract

let contractInst = null;

function archangelContract(silent) {
  if (contractInst)
    return contractInst;

  if (typeof window.web3 !== 'undefined')
    contractInst = createContract();
  else if (!silent)
    missingMetaMask();

  return contractInst;
} // archangelContract

class Ethereum {
  static get name() { return "Ethereum"; }

  constructor() {
    const contract = archangelContract(true);
    if (contract) {
      this.registrations = contract.Registration(
        { },
        {fromBlock: FromBlock},
        () => {}
      );
    } // if ...
  } // constructor

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

  async search(phrase) {
    const search = phrase.toLowerCase();
    const registrations = await this.registrationLog();
    return registrations.filter(
      r => r.payload.toLowerCase().indexOf(search) !== -1
    )
  } // search

  registrationLog() {
    return new Promise((resolve, reject) => {
      this.registrations.get((error, logs) => {
        if (error)
          return reject(error);
        return resolve(logs.map(l => JSON.parse(l.args._payload)));
      })
    });
  } // registrations

  ////////////////////////
  async eth_store(id, slug) {
    const contract = archangelContract();
    const slugStr = JSON.stringify(slug);

    return new Promise(async (pResolve, pReject) => {
      const accounts = web3().eth.accounts;
      if (accounts.length === 0)
        return pReject(new Error('No Ethereum account available.  Have you unlocked MetaMask?'))
      const account = accounts[0].toLowerCase();

      let stopped = false;
      const currentBlock = await this.currentBlockNumber();
      const noPermissionEvent = contract.NoWritePermission({ fromBlock: currentBlock-1 });
      const registration = contract.Registration({}, { fromBlock: currentBlock-1 });

      const resolve = (results) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        pResolve(results);
      } // resolve

      const reject = (err) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        pReject(err);
      } // reject

      noPermissionEvent.watch(
        (error, result) => {
          if (!error && result) {
            stopped = true;
            reject(new Error(`Sorry, account ${account} does not have permission to write to Archangel`));
          }
        });

      registration.watch(
        (error, result) => {
          if (!error && result) {
            stopped = true;
            resolve(`${id} written to Ethereum`)
          }
        });

      const onCommitted = (tx, timeout) => {
        web3().eth.getTransactionReceipt(tx, (err, result) => {
          if (stopped)
            return;

          if (result)
            return resolve(`Transaction ${tx} complete, but may not have succeeded.`);

          if (err)
            return reject(err);

          const diff = timeout.diff(DateTime.local(), 'seconds').values.seconds;
          if (diff <= 0)
            return reject(new Error(`Transaction ${tx} wasn't processed within ${this.txTimeout} seconds.`));

          setTimeout(() => onCommitted(tx, timeout), 1000);
        });
      }; // onCommitted

      const timeout = DateTime.local().plus({seconds: 60});
      contract.store(id, slugStr,
        {
          from: account,
          gas: 200000
        },
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

  currentBlockNumber() {
    return new Promise((resolve, reject) => {
      web3().eth.getBlockNumber((err, result) => {
        if(err)
          return reject(err);
        resolve(result);
      })
    })
  } // currentBlockNumber
} // class Ethereum

function createEthereumDriver() {
  return new Ethereum();
} // createEthereumDriver

export default createEthereumDriver;