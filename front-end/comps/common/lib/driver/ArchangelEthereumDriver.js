
const ArchangelContract = require('./ethereum/Archangel.json')

const Network = {
  "4": {
    id: 4,
    name: 'Rinkeby',
    fromBlock: 2898300,
    gasLimit: 7000000,
    gasPrice: 10*1e9
  },
  "3151": {
    id: 3151,
    name: 'Archangel-Dev',
    fromBlock: 80380,
    gasLimit: 75000000,
    gasPrice: undefined
  },
  "53419": {
    id: 53419,
    name: 'Archangel User Study',
    fromBlock: 1,
    gasLimit: 83886080,
    gasPrice: 10*1e9
  }
}

const NullId = '0x0000000000000000000000000000000000000000000000000000000000000000';

class ArchangelEthereumDriver {
  get resetEvent() { return "RESET"; }
  static get name() { return "Ethereum"; }

  constructor(web3) {
    this.ready = this.setup(web3);

    this.eventCallbacks_ = [ (event) => console.log(event) ];
  } // constructor

  //////////////////////////////////////////
  async setup(web3) {
    this.web3_ = web3;

    this.grants = { };

    this.network = await ArchangelEthereumDriver.findNetwork(web3);
    console.log(`Using ${this.network.name} network`);

    this.loadContract(this.network.id);

    this.startWatching();
    this.watchRegistrations();
    this.watchGrantPermissions();
  } // setup

  static findNetwork(web3) {
    return new Promise((resolve, reject) => {
      web3.version.getNetwork((err, netId) => {
        if (err)
          return reject(err);
        const network = Network[netId];
        resolve(network);
      })
    });
  } // findNetwork

  get networkName() { return this.network ? this.network.name : 'undetermined'; }
  get fromBlock() { return this.network.fromBlock; }
  get gasLimit() { return this.network.gasLimit; }
  get gasPrice() { return this.network.gasPrice; }

  loadContract(networkId) {
    const contractClass = this.web3_.eth.contract(ArchangelContract.abi);
    this.contract_ = contractClass.at(ArchangelContract.networks[networkId].address);
  } // loadContract

  watchEvents(callback) {
    console.log("watchEvents");

    this.eventCallbacks_.push(callback);
  } // watchEvents

  startWatching() {
    this.watcher_ = this.contract_.allEvents(
      { fromBlock: this.fromBlock },
      // eslint-disable-next-line
      (err, event) => this.eventCallbacks_.forEach(fn => fn(event))
    );
  } // startWatching

  watchRegistrations() {
    stopWatching(this.registrations, 'Registration');
    stopWatching(this.updates, 'Updates');

    this.registrations = this.contract_.Registration(
      { },
      { fromBlock: this.fromBlock },
      () => { }
    );
    this.updates = this.contract_.Update(
      { },
      { fromBlock: this.fromBlock },
      () => { }
    );
  } // watchRegistrations

  watchGrantPermissions() {
    stopWatching(this.grantsWatcher, 'GrantPermission')
    stopWatching(this.revokeWatcher, 'RevokePermission')

    this.grantsWatcher = this.contract_.PermissionGranted(
      { },
      { fromBlock: this.fromBlock },
      // eslint-disable-next-line
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
  account() {
    const accounts = this.web3_.eth.accounts;
    return (accounts.length !== 0) ? accounts[0].toLowerCase() : null
  } // addressName

  ////////////////////////////////////////////
  store(key, payload) {
    return this.eth_store(key, payload);
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
    const exact_match = (field, search) =>
      field && (field.toLowerCase() === search)
    const matches = (field, search) =>
      field && (field.toLowerCase().indexOf(search) !== -1);
    const file_hash_match = (files, search) =>
      files && !!files.find(f => (f.sha256_hash && (f.sha256_hash.toLowerCase() === search)));
    const file_uuid_match = (files, search) =>
      files && !!files.find(f => (f.uuid && (f.uuid.toLowerCase() === search)));
    const file_name_match = (files, search) =>
      files && !!files.find(f => (f.path && (f.path.toLowerCase().indexOf(search) !== -1)));
    const file_match = (files, search) =>
      file_hash_match(files, search) ||
      file_uuid_match(files, search) ||
      file_name_match(files, search)

    const search = phrase.toLowerCase();
    const registrations = await this.registrationLog();

    const results = registrations
       .filter(r => r.data)
       .filter(r =>
         exact_match(r.data.key, search) ||
         matches(r.data.collection, search) ||
         matches(r.data.citation, search) ||
         matches(r.data.ref, search) ||
         matches(r.data.supplier, search) ||
         matches(r.data.creator, search) ||
         matches(r.data.rights, search) ||
         matches(r.data.held, search) ||
         file_match(r.files, search))
       .reduce((acc, r) => {
           if (acc.has(r.key))
             acc.get(r.key).unshift(r)
           else
             acc.set(r.key, [r])
           return acc
         }, new Map()
       );

    const userAddress = this.account()
    const records = Array.from(results.values());
    for (const record of records) {
      for (const r of record) {
        const files = r.files
        r.owned = (userAddress === r.addr)
        r.hasFilenames = !!(files && files.find(f => f.path || f.name))
        r.hasUuid = !!(files && files.find(f => f.uuid))
      }
    }
    return records
  } // search

  ////////////////////////////////////////////
  recordLog(watcher) {
    return new Promise((resolve, reject) => {
      watcher.get((error, logs) => {
        if (error)
          return reject(error);

        const payloads = logs
          .map(l => { l.uploader = this.addressName(l.args._addr); return l; })
          .map(l => {
            const p = JSON.parse(l.args._payload);
            p.key = l.args._key;
            p.addr = l.args._addr;
            p.uploader = l.uploader;
            return p;
          });

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
  eth_store(id, slug) {
    const slugStr = JSON.stringify(slug);

    return new StorePromise(async (submitted, pResolve, pReject) => {
      const accounts = this.web3_.eth.accounts;
      if (accounts.length === 0)
        return pReject(new Error('No Ethereum account available.  Have you unlocked MetaMask?'))
      const account = accounts[0].toLowerCase();

      let stopped = false;
      let txHash = null;
      const startBlock = await this.currentBlockNumber();
      const blockOut = 6;
      const noPermissionEvent = this.contract_.NoWritePermission({ fromBlock: startBlock-1 });
      const registration = this.contract_.Registration({}, { fromBlock: startBlock-1 });
      const update = this.contract_.Update({}, { fromBlock: startBlock-1 });

      const completed = (fn, param) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        update.stopWatching();
        fn(param);
      };
      const resolve = results => completed(pResolve, results);
      const reject = err => completed(pReject, err);

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

      const onCommitted = () => {
        this.web3_.eth.getTransactionReceipt(txHash, async (err, result) => {
          if (stopped)
            return;

          if (result) {
            console.log(`Transaction for ${slug.name} complete`);
            stopped = true;
            return resolve(`Transaction for ${slug.name} complete, but could not determine outcome.`);
          } // if ...

          if (err && (err.message !== 'unknown transaction'))
            return reject(err);

          const block = await this.currentBlockNumber()
          if (block >= (startBlock + blockOut))
            return reject(new Error(`Transaction for ${slug.name} wasn't processed within ${blockOut} blocks`));

          setTimeout(onCommitted, 5000);
        });
      }; // onCommitted

      this.contract_.store.estimateGas(id, slugStr,
        {
          from: account,
          gas: this.gasLimit,
          gasPrice: this.gasPrice
        },
        (err, gas) => {
          if (err)
            return console.log('Could not estimate gas', err);
          console.log(`Gas estimate ${gas}`);
        });

      this.contract_.store(id, slugStr,
        {
          from: account,
          gas: this.gasLimit,
          gasPrice: this.gasPrice
        },
        (err, tx) => {
          if (err)
            return reject(err);
          txHash = tx;
          submitted(tx);
          console.log(`${id} submitted in transaction ${tx}`);
          onCommitted();
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

  eth_grant(addr, name) {
    const account = this.account()
    if (!account)
      throw new Error('No Ethereum account available.  Have you unlocked MetaMask?')

    this.contract_.grantPermission(
      addr,
      name,
      {
        from: account,
        gas: 500000
      },
      (err, tx) => {
        if (err)
          return console.log(err)
        console.log(`eth_grant(${addr},${name}) submitted in transaction ${tx}`);
      }
    );
  } // eth_store

  eth_remove(addr) {
    const account = this.account()
    if (!account)
      throw new Error('No Ethereum account available.  Have you unlocked MetaMask?')

    this.contract_.removePermission(
      addr,
      {
        from: account,
        gas: 500000
      },
      (err, tx) => {
        if (err)
          return console.log(err)
        console.log(`eth_remove(${addr}) submitted in transaction ${tx}`);
      }
    );
  } // eth_remove

  currentBlockNumber() {
    return new Promise((resolve, reject) => {
      this.web3_.eth.getBlockNumber((err, result) => {
        if(err)
          return reject(err);
        resolve(result);
      })
    })
  } // currentBlockNumber

  hasWritePermission() {
    return new Promise((resolve, reject) => {
      this.contract_.hasPermission(this.account(), (err, result) => {
        if(err)
          return reject(err);
        resolve(result);
      })
    })
  } // hasPermission
} // class Ethereum

function stopWatching(watcher, label) {
  try {
    if (watcher)
      watcher.stopWatching()
  } catch (err) {
    console.log(`Problem tearing down ${label} watcher`);
  }
} // stopWatching

class ExtendedPromise {
  constructor(action) {
    this.extendedCallback = () => { };
    this.catchCallback = () => { };

    this.promise = null;
    this.action = action;

    setTimeout(() => this.startAction(), 100);
  } // constructor

  startAction() {
    if (this.isThened)
      return;

    this.action(this.extendedCallback, () => { }, this.catchCallback);
  } // startAction

  get isThened() { return this.promise !== null; }

  extended(extendedCb) {
    this.extendedCallback = extendedCb;
    return this;
  } // extended

  then(thenCb) {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.action(e => this.extendedCallback(e),
          resolve,
          reject);
      }, 10)
    });
    this.promise = promise.then(thenCb);
    return this.promise;
  } // then

  catch(catchCb) {
    this.catchCallback = catchCb;
    return this;
  }
} // ExtendedPromise

class StorePromise extends ExtendedPromise {
  transaction(transactionCb) {
    return this.extended(transactionCb);
  } // transaction
}

export default ArchangelEthereumDriver;
