const ArchangelContract = require('./ethereum/Archangel.json')
const FromBlock = 80380;

class Ethereum {
  get resetEvent() { return "RESET"; }
  static get name() { return "Ethereum"; }

  constructor(web3) {
    this.setup(web3);
  } // constructor

  ////////////////////////////////////////////
  async setup(web3) {
    this.web3_ = web3;

    const networkId = 3151;
    this.loadContract(networkId);
  } // setup

  loadContract(networkId) {
    const contractClass = this.web3_.eth.contract(ArchangelContract.abi);
    this.contract_ = contractClass.at(ArchangelContract.networks[networkId].address);
  } // loadContract

  watchEvents(callback) {
    if (!this.watcher_)
      return this.startWatching(callback);

    this.watcher_.stopWatching(() => this.startWatching(callback));
  } // watchEvents

  startWatching(callback) {
    this.eventCallback_ = callback;

    this.eventCallback_(this.resetEvent);
    this.watcher_ = this.contract_.allEvents(
      { fromBlock: FromBlock },
      (err, event) => { this.eventCallback_(event) }
    );
  } // startWatching

  account() {
    const accounts = this.web3_.eth.accounts;
    return (accounts.length !== 0) ? accounts[0].toLowerCase() : null
  }

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
  } // eth_store

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
