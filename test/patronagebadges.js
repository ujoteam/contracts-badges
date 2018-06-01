const { assertRevert } = require('./helpers/assertRevert');

const ujoBadges = artifacts.require('UjoPatronageBadges');
const testOracle = artifacts.require('TestOracle');
let badges;
let oracle;

// NOTE: This disable is for all the event logs args having underscores
/* eslint-disable no-underscore-dangle */

contract('Auto Badges', (accounts) => {
  beforeEach(async () => {
    badges = await ujoBadges.new(accounts[0], { gas: 6720000, from: accounts[0] });
    oracle = await testOracle.new({ from: accounts[0] });
  });

  it('creation: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint('cid', accounts[1], { from: accounts[0] });
    await badges.mint('cid', accounts[1], { from: accounts[0] });
    await badges.mint('cid2', accounts[2], { from: accounts[0] });
    await badges.mint('cid2', accounts[2], { from: accounts[0] });

    const allTokens = await badges.getAllTokens.call(accounts[0]);

    const computedID1 = await badges.computeID.call('cid', 0, accounts[1]);
    const computedID2 = await badges.computeID.call('cid', 1, accounts[1]);
    const computedID3 = await badges.computeID.call('cid2', 0, accounts[2]);
    const computedID4 = await badges.computeID.call('cid2', 1, accounts[2]);

    console.log(computedID1);
    console.log(computedID1.toNumber());
    console.log(allTokens[0]);

    //todo: determine if the hashing is actually being done appropriately.
    //todo: it needs an external re-generation in Javascript to fully test.

    /* const totalSupply = await badges.totalSupply.call();
    const balance = await badges.balanceOf.call(accounts[0]);
    const owner = await badges.ownerOf.call(0);

    assert.strictEqual(totalSupply.toString(), '1');
    assert.strictEqual(adminBalance.toString(), '1');
    assert.strictEqual(accounts[0], owner); */
  });
});
