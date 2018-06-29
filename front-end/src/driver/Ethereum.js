import { DateTime } from 'luxon';

const ArchangelContract = require('./ethereum/Archangel.json')
const FromBlock = 80380;
const NullId = '0x0000000000000000000000000000000000000000000000000000000000000000';

const gasLimit = 750000

class Ethereum {
  static get name() { return "Ethereum"; }

  constructor(web3) {
    this.setup(web3);
  } // constructor

  ////////////////////////////////////////////
  async setup(web3) {
    this.web3_ = web3;

    this.grants = { }

    const networkId = 3151;
    this.loadContract(networkId);
    this.watchRegistrations();
    this.watchGrantPermissions();
  } // setup

  loadContract(networkId) {
    const contractClass = this.web3_.eth.contract(ArchangelContract.abi);
    this.contract_ = contractClass.at(ArchangelContract.networks[networkId].address);
  } // loadContract

  watchRegistrations() {
    stopWatching(this.registrations, 'Registration');
    stopWatching(this.updates, 'Updates');

    this.registrations = this.contract_.Registration(
      { },
      { fromBlock: FromBlock },
      (err, evt) => console.log(evt)
    );
    this.updates = this.contract_.Update(
      { },
      { fromBlock: FromBlock },
      (err, evt) => console.log(evt)
    );
  } // watchRegistrations

  watchGrantPermissions() {
    stopWatching(this.grantsWatcher, 'GrantPermission')

    this.grantsWatcher = this.contract_.PermissionGranted(
      { },
      { fromBlock: FromBlock },
      (err, evt) => {
        if (evt) this.grants[evt.args._addr] = evt.args._name
      }
    );
  } // watchGrantPermissions

  ////////////////////////////////////////////
  addressName(addr) {
    const name = this.grants[addr]
    return name ? name : 'unknown'
  } // addressName

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
    return registrations
      .filter(
        r =>
          matches(r.payload, search) ||
          matches(r.name, search) ||
          matches(r.comment, search) ||
          matches(r.parent_sha256_hash, search) ||
          exact_match(r.puid, search)
      )
      .sort((lhs, rhs) => rhs.timestamp.localeCompare(lhs.timestamp))
  } // search

  ////////////////////////////////////////////
  recordLog(watcher) {
    return new Promise((resolve, reject) => {
      watcher.get((error, logs) => {
        if (error)
          return reject(error);

        const payloads = logs
          .map(l => { l.uploader = this.addressName(l.args._addr); return l; })
          .map(l => { const p = JSON.parse(l.args._payload); p.uploader = l.uploader; return p; });

        return resolve(payloads);
      })
    });
  } // watcher

  async registrationLog() {
    const registrations = await this.recordLog(this.registrations);
    const updates = await this.recordLog(this.updates);

    registrations.push(...updates);

    return registrations;
  } // registrationLog

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
      const update = this.contract_.Update({}, { fromBlock: currentBlock-1 });

      const resolve = (results) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        update.stopWatching();
        pResolve(results);
      } // resolve

      const reject = (err) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        update.stopWatching();
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

      const txWritten = (error, result) => {
        console.log(result)
        if (!error && result && result.transactionHash === txHash) {
          stopped = true;
          resolve(`${slug.name} written to Ethereum`)
        }
      } // txWritten

      registration.watch(txWritten);
      update.watch(txWritten);

      const onCommitted = (timeout) => {
        this.web3_.eth.getTransactionReceipt(txHash, (err, result) => {
          if (stopped)
            return;

          if (result) {
            console.log(`Transaction for ${slug.name} complete`);
            stopped = true;
            return resolve(`Transaction for ${slug.name} complete, but could not determine outcome.`);
          } // if ...

          if (err && (err.message !== 'unknown transaction'))
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
          gas: gasLimit
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

function stopWatching(watcher, label) {
  try {
    if (watcher)
      watcher.stopWatching()
  } catch (err) {
    console.log(`Problem tearing down ${label} watcher`);
  }
} // stopWatching

export default Ethereum;
