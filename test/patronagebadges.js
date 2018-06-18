
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

// test todos:

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
    const gasEstimate = await web3.eth.estimateGas({ data: ujoBadges.bytecode });
    // eslint-disable-next-line max-len
    badges = await ujoBadges.new(accounts[0], { gas: parseInt((gasEstimate * 110) / 100, 0), from: accounts[0] });
    const gasEstimate2 = await web3.eth.estimateGas({ data: testOracle.bytecode });
    // eslint-disable-next-line max-len
    oracle = await testOracle.new({ gas: parseInt((gasEstimate2 * 110) / 100, 0), from: accounts[0] });
    await badges.setOracle(oracle.address, { from: accounts[0] });
  });

  it('should send the right amount of money to the benficiary and to the payer', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    const result = await badges.mint('cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('6', 'ether') });
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const fiveEther = web3.utils.toWei('5', 'ether');
    const expectedBalSender = parseInt(beforeBalanceSender) - parseInt(fiveEther) - parseInt(gasCost);
    const expectedBalBen = parseInt(beforeBalanceBen) + parseInt(fiveEther);
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen, expectedBalBen);
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

    assert.equal(await badges.totalSupply(), 4);
    await badges.burnToken(computedID1);
    assert.equal(await badges.totalSupply(), 3);
  });
  
  it('sould get all tokens by an owner', async() => {
    await badges.mint('cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint('cid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const allbadges = await badges.getAllTokens(accounts[0]);
    const id1 = await badges.computeID.call('cid', accounts[1], 5, 0);
    const id2 = await badges.computeID.call('cid2', accounts[2], 5, 0);
    const array = [id1, id2];
    assert.deepEqual(allbadges, array);
  })
  it('should allow setting URI', async() => {
    await badges.mint('cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const id = await badges.computeID.call('cid', accounts[1], 5, 0);
    await badges.setTokenURI(id, 'cid1');
    const newURI = await badges.tokenURI(id);
    assert.equal(newURI, 'cid1');
  });

  it('should allow admin change', async() => {
    await badges.changeAdmin(accounts[1], {from: accounts[0]});
    const newAdmin = await badges.admin.call();
    assert.equal(newAdmin, accounts[1]);
  });

  it('should allow oracle to be changed', async() => {
    const newOracle = await testOracle.new();
    await badges.setOracle(newOracle.address, {from: accounts[0]});
    const checkOracle = await badges.oracle.call();
    assert.equal(checkOracle, newOracle.address);
  });

  it('should fail if amount is less than $5', async() => {
    assertRevert(badges.mint('cid', accounts[1],5, {from: accounts[0], value: web3.utils.toWei('4', 'ether')}));
  });

  it('should fail if usdCost is 0', async() => {
    assertRevert(badges.mint('cid', accounts[1], 0, {from: accounts[0], value: web3.utils.toWei('0', 'ether')}));
  })

  it('should fail if exchange rate is 0', async() => {
    await oracle.setStringPrice("0");
    assertRevert(badges.mint('cid', accounts[1], 5, {from: accounts[0], value: web3.utils.toWei('5', 'ether')}));
  });

});
