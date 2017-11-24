class Ethereum {
  async store(id, payload, timestamp) {
    alert("Ethereum.store not yet implemented");
  } // store

  async fetch(id) {
    alert("Ethereum.fetch not yet implemented");
  } // fetch
} // class Ethereum

function createEthereumDriver() {
  return new Ethereum();
} // createEthereumDriver

export default createEthereumDriver;