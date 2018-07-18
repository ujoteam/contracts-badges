const PatronageBadges = artifacts.require('./UjoPatronageBadges.sol');

module.exports = async (deployer, network) => {
  // admin: 0x5DedA52Dc2b3A565d77E10F0f8D4Bd738401D7d3
  // rinkeby oracle: 0x57257ede587dd4ddf99cf95dbe308830e154acf7 [manually setting it atm]
  if (network === 'mainnet') {
    deployer.deploy(PatronageBadges, '0x5DedA52Dc2b3A565d77E10F0f8D4Bd738401D7d3', '0x57257ede587dd4ddf99cf95dbe308830e154acf7');
  }
};
