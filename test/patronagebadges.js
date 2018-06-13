
const { assertRevert } = require('./helpers/assertRevert');

const ujoBadges = artifacts.require('UjoPatronageBadges');
const testOracle = artifacts.require('TestOracle');
// const strings = artifacts.require('strings');

const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
let badges;
let oracle;

// NOTE: This disable is for all the event logs args having underscores
/* eslint-disable no-underscore-dangle */

// test token URIs
// test get function

function removeLeadingZeros(hex) {
  if (hex.charAt(0) === '0') {
    return removeLeadingZeros(hex.slice(1));
  }
  return hex;
}

function checkHexEquality(hex1, hex2) {
  if (hex1 === hex2) {
    return true;
  }
  const hex1noZero = removeLeadingZeros(hex1.slice(2));
  const hex2noZero = removeLeadingZeros(hex2.slice(2));
  return hex1noZero === hex2noZero;
}

contract('Auto Badges', (accounts) => {
  beforeEach(async () => {
    badges = await ujoBadges.new(accounts[0], { gas: 6720000, from: accounts[0] });
    oracle = await testOracle.new({ from: accounts[0] });
    await badges.setOracle(oracle.address, { from: accounts[0] });
  });

  it('creation: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint('cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint('cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint('cid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint('cid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const allTokens = await badges.getAllTokens.call(accounts[0]);
    const jscomputedid1 = web3.utils.soliditySha3('cid', accounts[1], 5, 0);
    const jscomputedid2 = web3.utils.soliditySha3('cid', accounts[1], 5, 1);
    const jscomputedid3 = web3.utils.soliditySha3('cid2', accounts[2], 5, 0);
    const jscomputedid4 = web3.utils.soliditySha3('cid2', accounts[2], 5, 1);
    const computedID1 = await badges.computeID.call('cid', accounts[1], 5, 0);
    const computedID2 = await badges.computeID.call('cid', accounts[1], 5, 1);
    const computedID3 = await badges.computeID.call('cid2', accounts[2], 5, 0);
    const computedID4 = await badges.computeID.call('cid2', accounts[2], 5, 1);
    console.log(allTokens[0]);
    console.log(web3.utils.toHex(computedID1));
    console.log(jscomputedid1);
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
  });

  // it('should fail if amount is less than $5', async() => {
  //   assertRevert(await badges.mint('cid', accounts[1], {from: accounts[0], value: web3.utils.toWei('4', 'ether')}));
  // })

  it('should send the right amount of money to the benficiary and to the payer', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    await badges.mint('cid', accounts[1], { from: accounts[0], value: web3.utils.toWei('6', 'ether') });
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const fiveEther = web3.utils.toWei('5', 'ether');
    const expectedBalSender = beforeBalanceSender - fiveEther;
    const expectedBalBen = beforeBalanceBen + fiveEther;
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen.toString(), expectedBalBen.toString());
  });
});
