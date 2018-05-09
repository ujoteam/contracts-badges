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
      provider: new HDWalletProvider(mnemonic, mainnetProviderUrl, 0),
      gas: 4700000,
      gasPrice: 10000000000,
    },
    rinkeby: {
      network_id: 4,
      provider: new HDWalletProvider(mnemonic, rinkebyProviderUrl, 1),
      gas: 4700000,
      gasPrice: 20000000000,
    },
  },
};
