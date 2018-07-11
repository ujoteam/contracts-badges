
const { assertRevert } = require('./helpers/assertRevert');
const { assertJump } = require('./helpers/assertJump');

const ujoBadges = artifacts.require('UjoPatronageBadges');
const testOracle = artifacts.require('TestOracle');
// const strings = artifacts.require('strings');

const BigNumber = require('bignumber.js');

const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
let badges;
let oracle;

// NOTE: This disable is for all the event logs args having underscores
/* eslint-disable no-underscore-dangle */

// test todos:

/* function removeLeadingZeros(hex) {
  if (hex.charAt(0) === '0') {
    return removeLeadingZeros(hex.slice(1));
  }
  return hex;
} */

/* function checkHexEquality(hex1, hex2) {
  if (hex1 === hex2) {
    return true;
  }
  const hex1noZero = removeLeadingZeros(hex1.slice(2));
  const hex2noZero = removeLeadingZeros(hex2.slice(2));
  return hex1noZero === hex2noZero;
} */

contract('Patronage Badges', (accounts) => {
  beforeEach(async () => {
    const gasEstimate2 = await web3.eth.estimateGas({ data: testOracle.bytecode });
    // eslint-disable-next-line max-len
    oracle = await testOracle.new({ gas: parseInt((gasEstimate2 * 110) / 100, 0), from: accounts[1] });

    const gasEstimate = await web3.eth.estimateGas({ data: ujoBadges.bytecode });
    // eslint-disable-next-line max-len
    badges = await ujoBadges.new(accounts[0], oracle.address, { gas: parseInt((gasEstimate * 110) / 100, 0), from: accounts[0] });
  });

  it('minting: mint and test events', async () => {
    const result = await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid1', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('6', 'ether') });
    const jscomputedid1 = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid1', accounts[1], 5, 0);
    assert.equal(web3.utils.toHex(result.logs[0].args.tokenId), jscomputedid1);
    assert.equal(result.logs[0].args.cid, 'cidcidcidcidcidcidcidcid1');
    assert.equal(result.logs[0].args.beneficiaryOfBadge, accounts[1]);
    assert.equal(result.logs[0].args.usdCostOfBadge.toString(), '5');
    assert.equal(result.logs[0].args.badgeNumber.toString(), '0');
    assert.equal(result.logs[0].args.buyer, accounts[0]);
    assert.equal(result.logs[0].args.issuer, accounts[0]);
  });

  it('minting: should send the right amount of money to the benficiary and to the payer', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    const result = await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('6', 'ether') });
    /* eslint-disable prefer-destructuring */
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const fiveEther = web3.utils.toWei('5', 'ether');
    /* eslint-disable max-len */
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(fiveEther)).minus(BigNumber(gasCost));
    const expectedBalBen = BigNumber(beforeBalanceBen).plus(BigNumber(fiveEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen, expectedBalBen);
  });

  it('minting: should fail if amount is less than specified USD (5 usd, paying 4 usd).', async () => {
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('4', 'ether') }));
  });

  it('minting: should fail if usdCost is 0', async () => {
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 0, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: should fail if exchange rate is 0', async () => {
    await oracle.setStringPrice('0');
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') }));
  });

  it('minting/burning: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid3', accounts[3], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const jscomputedid1 = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid', accounts[1], 5, 0);
    const jscomputedid2 = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid', accounts[1], 5, 1);
    const jscomputedid3 = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid2', accounts[2], 5, 0);
    assert.equal(await badges.totalSupply(), 5);
    await badges.burnToken(jscomputedid1);
    await badges.burnToken(jscomputedid2);
    await badges.burnToken(jscomputedid3);
    assert.equal(await badges.totalSupply(), 2);
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });


    assert.equal(await badges.totalSupply(), 5);
  });

  it('minting: mint 1 token for another buyer', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const jscomputedid1 = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid', accounts[1], 5, 0);
    const owner = await badges.ownerOf.call(jscomputedid1);
    assert.equal(owner, accounts[2]);
  });

  it('minting: mint should fail due to overflow in multiplication', async () => {
    await assertJump(badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0], value: web3.utils.toWei('5', 'ether') }));
  });

  it('minting: should store & get all tokens by an owner', async () => {
    await badges.mint(accounts[0], 'cid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await badges.mint(accounts[0], 'cid2', accounts[2], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const allbadges = await badges.getAllTokens(accounts[0]);
    const revisedAllBadges = [web3.utils.toHex(allbadges[0]), web3.utils.toHex(allbadges[1])];
    const id1 = web3.utils.soliditySha3('cid', accounts[1], 5, 0);
    const id2 = web3.utils.soliditySha3('cid2', accounts[2], 5, 0);
    const array = [id1, id2];
    assert.deepEqual(revisedAllBadges, array);
  });

  it('URI: should allow setting URI & fail when set by someone else', async () => {
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    const id = web3.utils.soliditySha3('cidcidcidcidcidcidcidcid', accounts[1], 5, 0);
    await badges.setTokenURI(id, 'cidcidcidcidcidcidcidcid1', { from: accounts[0] });
    const newURI = await badges.tokenURI.call(id);
    assert.equal(newURI, 'cidcidcidcidcidcidcidcid1');
    await assertRevert(badges.setTokenURI(id, 'cid32', { from: accounts[1] }));
  });

  it('URI: should revert if set for a token that doesnt exist', async () => {
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', accounts[1], 5, { from: accounts[0], value: web3.utils.toWei('5', 'ether') });
    await assertRevert(badges.setTokenURI(3, 'newcid', { from: accounts[0] }));
  });

  it('admin: should allow admin change & fail when setting by someone else', async () => {
    await badges.changeAdmin(accounts[1], { from: accounts[0] });
    const newAdmin = await badges.admin.call();
    assert.equal(newAdmin, accounts[1]);
    await assertRevert(badges.changeAdmin(accounts[2], { from: accounts[0] }));
  });

  it('oracle: should allow oracle to be changed & fail when changed by someone else', async () => {
    const newOracle = await testOracle.new();
    await badges.setOracle(newOracle.address, { from: accounts[0] });
    const checkOracle = await badges.oracle.call();
    assert.equal(checkOracle, newOracle.address);
    await assertRevert(badges.setOracle(oracle.address, { from: accounts[1] }));
  });
});
