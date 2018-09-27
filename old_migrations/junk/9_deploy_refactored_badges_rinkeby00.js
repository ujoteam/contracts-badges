const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');
// const InitBadges = artifacts.require('./InitBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862 [account 1 on mnemomic]
  // rinkeby oracle: 0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B [manually setting it atm]
  if (network === 'ganache') {
    let deployedFunctionsInstance;
    deployer.deploy(Functions).then((deployedFunctions) => {
      deployedFunctionsInstance = deployedFunctions;
      return deployer.deploy(BadgesProxy, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862', deployedFunctionsInstance.address);
    }).then((deployedProxy) => {
      console.log(deployedProxy.address);
      return Functions.at(deployedProxy.address);
    }).then((deployedBadgesProxy) => {
      // console.log
      return deployedBadgesProxy.setupBadges(deployedFunctionsInstance.address, '0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B');
    });
  }
};
