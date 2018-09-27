const PatronageBadges = artifacts.require('./UjoPatronageBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862 [account 2 on mnemomic]
  if (network === 'rinkeby') {
    deployer.deploy(PatronageBadges, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862');
  }
};
