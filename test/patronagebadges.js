
const { assertRevert } = require('./helpers/assertRevert');
const ujoBadges = artifacts.require('UjoPatronageBadges');
const testOracle = artifacts.require('TestOracle');
const strings = artifacts.require('strings');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
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
    const allTokens = await badges.getAllTokens.call(accounts[0]);
    const jscomputedid1 = web3.utils.soliditySha3('cid', 0, accounts[1]);
    const jscomputedid2 = web3.utils.soliditySha3('cid', 1, accounts[1]);
    const jscomputedid3 = web3.utils.soliditySha3('cid2', 0, accounts[2]);
    const jscomputedid4 = web3.utils.soliditySha3('cid2', 1, accounts[2]);
    const computedID1 = await badges.computeID.call('cid', 0, accounts[1]);
    const computedID2 = await badges.computeID.call('cid', 1, accounts[1]);
    const computedID3 = await badges.computeID.call('cid2', 0, accounts[2]);
    const computedID4 = await badges.computeID.call('cid2', 1, accounts[2]);
    console.log(allTokens[0]);
    assert.isTrue(checkHexEquality(web3.utils.toHex(computedID1), jscomputedid1));
    assert.isTrue(checkHexEquality(web3.utils.toHex(computedID2), jscomputedid2));
    assert.isTrue(checkHexEquality(web3.utils.toHex(computedID3), jscomputedid3));
    assert.isTrue(checkHexEquality(web3.utils.toHex(computedID4), jscomputedid4));
  

    // determine if the hashing is actually being done appropriately.
    // it needs an external re-generation in Javascript to fully test.

    // const totalSupply = await badges.totalSupply.call();
    // const balance = await badges.balanceOf.call(accounts[0]);
    // const owner = await badges.ownerOf.call(0);

    // assert.strictEqual(totalSupply.toString(), '1');
    // assert.strictEqual(adminBalance.toString(), '1');
    // assert.strictEqual(accounts[0], owner);
  })

  // it("should fail if amount is less than $5", async() => {
  //   assertRevert(await badges.mint('cid', accounts[1], {from: accounts[0], value: web3.utils.toWei("4", "ether")}));
  // })

  // it("should send the right amount of money to the benficiary and to the payer", async() => {
  //   var beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
  //   console.log(beforeBalanceSender);
  //   // const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
  //   await badges.mint('cid', accounts[1], {from:accounts[0], value:web3.utils.toWei("6","ether")});
  //   var newBalSender = await web3.eth.getBalance(accounts[0]);
  //   console.log(newBalSender);
  //   assert.equal((await web3.eth.getBalance(accounts[0])), beforeBalanceSender - 5);
  //   // assert.equal((await web3.eth.getBalance(accounts[1]).toNumber()), beforeBalanceBen.toNumber() + 5);
  // })
});

function checkHexEquality(hex1, hex2) {
  if(hex1 == hex2){
    return true;
  } else {
    hex1 = removeLeadingZeros(hex1.slice(2));
    hex2 = removeLeadingZeros(hex2.slice(2));
    return hex1 == hex2;
  }
}

function removeLeadingZeros(hex) {
  if (hex.charAt(0) == '0'){
    return removeLeadingZeros(hex.slice(1));
  } else {
    return hex;
  }
}
