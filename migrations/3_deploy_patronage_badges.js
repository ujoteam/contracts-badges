const PatronageBadges = artifacts.require('./UjoPatronageBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862 [account 2 on mnemomic]
  if (network === 'rinkeby') {
    deployer.deploy(PatronageBadges, '0x1fbeC754f37fC179d5332c2cA9131B19Ce6AE862');
  }

  if (network === 'mainnet') {
    deployer.deploy(PatronageBadges, '0xc293fb50262e7d6dfaca1e0ce72472f517413fa5');
  }
};
