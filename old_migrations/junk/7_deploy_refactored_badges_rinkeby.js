const PatronageBadges = artifacts.require('./UjoPatronageBadges.sol');
const InitBadges = artifacts.require('./InitBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862 [account 1 on mnemomic]
  // rinkeby oracle: 0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B [manually setting it atm]
  if (network === 'rinkeby') {
    let deployedInitInstance;
    deployer.deploy(InitBadges).then((deployedInit) => {
      deployedInitInstance = deployedInit;
      return deployer.deploy(PatronageBadges, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862', '0x928f3D0659404AbB6C79E4b6390D72F3913D7D0B');
    }).then(() => PatronageBadges.deployed())
      .then(deployedBadges => deployedBadges.setupBadges(deployedInitInstance.address));
  }
};
