const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');
const InitBadges = artifacts.require('./InitBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0xfc14d974220678049ad4f8199386fe8f2784a0ff [account 1 on mnemomic]
  // rinkeby oracle: 0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B [manually setting it atm]
  if (network === 'rinkeby') {
    let deployedFunctionsInstance;
    let initInstance;
    deployer.deploy(Functions).then((deployedFunctions) => {
      deployedFunctionsInstance = deployedFunctions;
      return deployer.deploy(InitBadges);
    }).then((deployedInit) => {
      initInstance = deployedInit;
      return deployer.deploy(BadgesProxy, '0xfc14d974220678049ad4f8199386fe8f2784a0ff', deployedFunctionsInstance.address);
    }).then((deployedProxy) => {
      console.log(deployedProxy.address);
      return Functions.at(deployedProxy.address);
    }).then((deployedBadgesProxy) => {
      console.log('setting up badges');
      return deployedBadgesProxy.setupBadges(initInstance.address, '0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B');
    });
  }
};
