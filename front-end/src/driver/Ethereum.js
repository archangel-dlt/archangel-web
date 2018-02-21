import ArchangelABI from './ethereum/Archangel';
import { DateTime } from 'luxon';

const ArchangelAddress = '0x3507dCef171f6B7F36c56e35013d0785B150584F'.toLowerCase();
const FromBlock = 1378500;
const NullId = '0x0000000000000000000000000000000000000000000000000000000000000000';

class Ethereum {
  static get name() { return "Ethereum"; }

  constructor(web3) {
    this.setup(web3);
  } // constructor

  ////////////////////////////////////////////
  setup(web3) {
    this.web3_ = web3;
    this.loadContract();
    this.watchRegistrations();
  } // setup

  loadContract() {
    const contractClass = this.web3_.eth.contract(ArchangelABI);
    this.contract_ = contractClass.at(ArchangelAddress);
  } // loadContract

  watchRegistrations() {
    this.registrations = this.contract_.Registration(
      { },
      { fromBlock: FromBlock },
      (err, evt) => console.log(evt)
    );
  } // watchRegistrations

  ////////////////////////////////////////////
  async store(droid_payloads, progress) {
    const uploads = droid_payloads.map(droid_payload => {
      progress.message(`Submitting ${droid_payload.name}`);
      return this.eth_store(droid_payload.sha256_hash, droid_payload)
        .then(msg => progress.message(msg))
        .catch(msg => progress.error(msg));
    });
    return Promise.all(uploads);
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
    const matches = (field, search) =>
      field && field.toLowerCase().indexOf(search) !== -1;
    const exact_match = (field, search) =>
      field && field.toLowerCase() === search;

    const search = phrase.toLowerCase();
    const registrations = await this.registrationLog();
    return registrations.filter(
      r =>
        matches(r.payload, search) ||
        matches(r.name, search) ||
        matches(r.comment, search) ||
        matches(r.parent_sha256_hash, search) ||
        exact_match(r.puid, search)
    )
  } // search

  ////////////////////////////////////////////
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
    const slugStr = JSON.stringify(slug);

    return new Promise(async (pResolve, pReject) => {
      const accounts = this.web3_.eth.accounts;
      if (accounts.length === 0)
        return pReject(new Error('No Ethereum account available.  Have you unlocked MetaMask?'))
      const account = accounts[0].toLowerCase();

      let stopped = false;
      let txHash = null;
      const currentBlock = await this.currentBlockNumber();
      const noPermissionEvent = this.contract_.NoWritePermission({ fromBlock: currentBlock-1 });
      const registration = this.contract_.Registration({}, { fromBlock: currentBlock-1 });

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
          console.log(result)
          if (!error && result && result.transactionHash === txHash) {
            stopped = true;
            reject(new Error(`Sorry, account ${account} does not have permission to write to Archangel`));
          }
        });

      registration.watch(
        (error, result) => {
          console.log(result)
          if (!error && result && result.transactionHash === txHash) {
            stopped = true;
            resolve(`${slug.name} written to Ethereum`)
          }
        });

      const onCommitted = (timeout) => {
        this.web3_.eth.getTransactionReceipt(txHash, (err, result) => {
          if (stopped)
            return;

          if (result) {
            console.log(`Transaction for ${slug.name} complete`);
            stopped = true;
            return;
          }

          if (err)
            return reject(err);

          const diff = timeout.diff(DateTime.local(), 'seconds').values.seconds;
          if (diff <= 0)
            return reject(new Error(`Transaction for ${slug.name} wasn't processed within ${timeout} seconds`));

          setTimeout(() => onCommitted(timeout), 5000);
        });
      }; // onCommitted

      const timeout = DateTime.local().plus({seconds: 60});
      this.contract_.store(id, slugStr,
        {
          from: account,
          gas: 500000
        },
        (err, tx) => {
          if (err)
            return reject(err);
          txHash = tx;
          console.log(`${slug.name} submitted in transaction ${tx}`);
          onCommitted(timeout);
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
    return new Promise((resolve, reject) => {
      this.contract_[methodName].call(id,
        (err, results) => {
          if (err)
            return reject(err);
          resolve(results);
        });
    }); // eth_fetch
  } // eth_call_fetch

  currentBlockNumber() {
    return new Promise((resolve, reject) => {
      this.web3_.eth.getBlockNumber((err, result) => {
        if(err)
          return reject(err);
        resolve(result);
      })
    })
  } // currentBlockNumber
} // class Ethereum

export default Ethereum;