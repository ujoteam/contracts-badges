const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');
const InitBadges = artifacts.require('./InitBadges.sol');

module.exports = async (deployer, network) => {
  // deployment process:
  // 1) deploy functions
  // 2) deploy initbadges
  // 3) deploy proxy [with 0xfc as owner -> acc 1 on mnemonic]
  // 4) set up badges [with 0xfc as owner -> acc 1 on mnemonic]
  // 5) change proxy owner to multi-sig
  if (network === 'mainnet') {
    const deployingAdmin = '0xfc14d974220678049ad4f8199386fe8f2784a0ff';
    const finalAdmin = '0x5DedA52Dc2b3A565d77E10F0f8D4Bd738401D7d3'; // ujo multisig
    const mainnetOracle = '0x57257EDE587dd4dDF99Cf95DbE308830e154acF7';
    let deployedFunctionsInstance;
    let deployedProxyInstance;
    let initInstance;
    deployer.deploy(Functions).then((deployedFunctions) => {
      deployedFunctionsInstance = deployedFunctions;
      return deployer.deploy(InitBadges);
    }).then((deployedInit) => {
      initInstance = deployedInit;
      return deployer.deploy(BadgesProxy, deployingAdmin, deployedFunctionsInstance.address);
    }).then((deployedProxy) => {
      deployedProxyInstance = deployedProxy;
      console.log(deployedProxy.address);
      return Functions.at(deployedProxy.address);
    }).then((deployedBadgesProxy) => {
      console.log('setting up badges');
      return deployedBadgesProxy.setupBadges(initInstance.address, mainnetOracle);
    }).then(() => {
      return deployedProxyInstance.transferOwnership(finalAdmin);
    }).then(() => {
      return deployedProxyInstance.owner.call();
    }).then((currentOwner) => {
      console.log(currentOwner);
    });
  }
};
