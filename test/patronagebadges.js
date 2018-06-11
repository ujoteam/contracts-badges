const { assertRevert } = require('./helpers/assertRevert');
const web3 = require('web3');
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
    await badges.setOracle(oracle.address, {from: accounts[0]});
  });

  it('creation: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint('cid', accounts[1], { from: accounts[0], value: web3.utils.toWei("5", "ether") });
    await badges.mint('cid', accounts[1], { from: accounts[0], value: web3.utils.toWei("5", "ether") });
    await badges.mint('cid2', accounts[2], { from: accounts[0], value: web3.utils.toWei("5", "ether") });
    await badges.mint('cid2', accounts[2], { from: accounts[0], value: web3.utils.toWei("5", "ether") });
    console.log((await oracle.getUintPrice()).toNumber());
    const allTokens = await badges.getAllTokens.call(accounts[0]);

    const computedID1 = await badges.computeID.call('cid', 0, accounts[1]);
    const computedID2 = await badges.computeID.call('cid', 1, accounts[1]);
    const computedID3 = await badges.computeID.call('cid2', 0, accounts[2]);
    const computedID4 = await badges.computeID.call('cid2', 1, accounts[2]);
    
    const jscomputedid1 = web3.utils.soliditySha3('cid', '0', accounts[1]);
    console.log(jscomputedid1);
    console.log(computedID1);
    console.log(web3.utils.toHex(computedID1));
    console.log(allTokens[0]);

    //todo: determine if the hashing is actually being done appropriately.
    //todo: it needs an external re-generation in Javascript to fully test.

    /* const totalSupply = await badges.totalSupply.call();
    const balance = await badges.balanceOf.call(accounts[0]);
    const owner = await badges.ownerOf.call(0);

    assert.strictEqual(totalSupply.toString(), '1');
    assert.strictEqual(adminBalance.toString(), '1');
    assert.strictEqual(accounts[0], owner); */
  })

  // it("should fail if amount is less than $5", async() => {
  //   assertRevert(await badges.mint('cid', accounts[1], {from: accounts[0], value: web3.utils.toWei("4", "ether")}));
  // })

  it("should send the right amount of money to the benficiary and to the payer", async() => {
    const beforeBalanceSender = web3.getBalance(accounts[0]);
    const beforeBalanceBen = web3.getBalance(accounts[1]);
    await badges.mint('cid', accounts[1], {from:accounts[0], value:web3.utils.toWei("6","ether")});
    assert.equal(web3.eth.getBalance(accounts[0]).toNumber(), beforeBalanceSender.toNumber() - 5);
    assert.equal(web3.eth.getBalance(accounts[1]).toNumber(), beforeBalanceBen.toNumber() + 5);
  })

  function keccak256(...args) {
    args = args.map(arg => {
      if (typeof arg === 'string') {
        if (arg.substring(0, 2) === '0x') {
            return arg.slice(2)
        } else {
            return web3.toHex(arg).slice(2)
        }
      }
  
    })
  
    args = args.join('')
  
    return web3.sha3(args, { encoding: 'hex' })
  }
});
