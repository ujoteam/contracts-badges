const TruffleContract = require('truffle-contract');

const Badges = artifacts.require('./UjoAutoBadges.sol');

const HandlerJSON = require('ujo-contracts-handlers');

const Handler = TruffleContract(HandlerJSON.ETHUSDHandler);


module.exports = async (deployer, network) => {
  // admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862 [account 2 on mnemomic]
  if (network === 'rinkeby') {
    let handlerInstance;
    Handler.setProvider(web3.currentProvider);
    deployer.then(() => Handler.deployed())
      .then((returnedHandlerInstance) => {
        handlerInstance = returnedHandlerInstance;
        return deployer.deploy(Badges, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862');
      }).then(() => Badges.deployed())
      .then(deployedBadges => deployedBadges.setApprovedHandler(handlerInstance.address, true));
  }

  // initial admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862
  // then changed to Ujo MultiSig
  // admin: 0x5deda52dc2b3a565d77e10f0f8d4bd738401d7d3 [Ujo MultiSig]
  if (network === 'mainnet') {
    let handlerInstance;
    Handler.setProvider(web3.currentProvider);
    deployer.then(() => Handler.deployed())
      .then((returnedHandlerInstance) => {
        handlerInstance = returnedHandlerInstance;
        return deployer.deploy(Badges, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862');
      }).then(() => Badges.deployed())
      .then(deployedBadges => deployedBadges.setApprovedHandler(handlerInstance.address, true));
  }
};
