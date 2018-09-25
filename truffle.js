const HDWalletProvider = require('truffle-hdwallet-provider');

// Get our mnemonic and create an hdwallet
const mnemonic = ''; // this mnemonic for deployment is secret.

// Get the first account using the standard hd path.
const rinkebyProviderUrl = 'https://rinkeby.infura.io';
const mainnetProviderUrl = 'https://mainnet.infura.io';

module.exports = {
  networks: {
    mainnet: {
      network_id: 1,
      provider: new HDWalletProvider(mnemonic, mainnetProviderUrl, 1),
      // gas: 4700000,
      gasPrice: 20000000000,
    },
    rinkeby: {
      network_id: 4,
      provider: new HDWalletProvider(mnemonic, rinkebyProviderUrl, 1),
      gasPrice: 10000000000,
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555, // If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    ganache: {
      provider: new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545/', 1),
      port: '8545',
      network_id: '*',
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 21,
    },
  },
};
