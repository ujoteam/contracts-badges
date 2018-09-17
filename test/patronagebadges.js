
const { assertRevert } = require('./helpers/assertRevert');

const ujoBadges = artifacts.require('UjoPatronageBadges');
const ujoBadgesFunctions = artifacts.require('UjoPatronageBadgesFunctions');
const testOracle = artifacts.require('TestOracle');
const testInit = artifacts.require('TestInitialise.sol');

const BigNumber = require('bignumber.js');

const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
let badges;
let badgesProxy;
let oracle;
let functions;

contract('Patronage Badges', (accounts) => {
  beforeEach(async () => {
    const gasEstimateFunctions = await web3.eth.estimateGas({ data: ujoBadgesFunctions.bytecode });
    // eslint-disable-next-line max-len
    functions = await ujoBadgesFunctions.new(accounts[1], { gas: parseInt((gasEstimateFunctions * 120) / 100, 0), from: accounts[1] });

    const gasEstimateOracle = await web3.eth.estimateGas({ data: testOracle.bytecode });
    // eslint-disable-next-line max-len
    oracle = await testOracle.new({ gas: parseInt((gasEstimateOracle * 120) / 100, 0), from: accounts[1] });

    const gasEstimateBadgesProxy = await web3.eth.estimateGas({ data: ujoBadges.bytecode });

    // eslint-disable-next-line max-len
    badgesProxy = await ujoBadges.new(accounts[4], functions.address, { gas: parseInt((gasEstimateBadgesProxy * 120) / 100, 0), from: accounts[4] });
    badges = await ujoBadgesFunctions.at(badgesProxy.address);

    await badges.setupBadges('0x0', oracle.address, { from: accounts[4] });
  });

  it('initialization: test appropriate initialization', async () => {
    const gasEstimate = await web3.eth.estimateGas({ data: ujoBadges.bytecode });
    // eslint-disable-next-line max-len
    const gasForTestInit = await web3.eth.estimateGas({ data: testInit.bytecode });
    const deployedTest = await testInit.new({
      gas: parseInt((gasForTestInit * 120) / 100, 0),
      from: accounts[4],
    });
    const badgesProxy2 = await ujoBadges.new(accounts[4], functions.address, {
      gas: parseInt((gasEstimate * 120) / 100, 0),
      from: accounts[4],
    });

    const badges2 = ujoBadgesFunctions.at(badgesProxy2.address);
    // eslint-disable-next-line max-len
    const setup = await badges2.setupBadges(deployedTest.address, oracle.address, { from: accounts[4] });
    const block = await web3.eth.getBlock(setup.receipt.blockNumber);
    // eslint-disable-next-line max-len
    assert.equal(setup.logs[6].args.tokenId.toNumber(), 4); // eslint-disable-line max-len
    assert.equal(setup.logs[6].args.nftcid, 'zdpuAs68Gq3tWg81Bmf1J1b8WCgTDtJpVYqV4BvwoMW6RRUF8');
    assert.equal(setup.logs[6].args.timeMinted.toString(), block.timestamp);
    assert.equal(web3.utils.toChecksumAddress(setup.logs[6].args.buyer), '0x6c0a787BBAB04F9882e88adD5bdF5d04C9aa650A');
    assert.equal(setup.logs[6].args.issuer, accounts[4]);
    const totalTokens = await badges2.totalSupply.call();
    assert.equal(totalTokens.toNumber(), 17);
  });

  // eslint-disable-next-line max-len
  it('minting: mint and test events', async () => {
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft1', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const block = await web3.eth.getBlock(result.receipt.blockNumber);

    // BadgeMinted
    assert.equal(result.logs[0].args.tokenId.toNumber(), 1);
    assert.equal(result.logs[0].args.nftcid, 'qmxnftqmxnftqmxnftqmxnft1');
    assert.equal(result.logs[0].args.timeMinted.toString(), block.timestamp);
    assert.equal(result.logs[0].args.buyer, accounts[0]);
    assert.equal(result.logs[0].args.issuer, accounts[0]);

    // PaymentProcessed
    assert.equal(result.logs[1].args.tokenId.toNumber(), 1);
    assert.deepEqual(result.logs[1].args.beneficiaries, [accounts[1]]);
    const eventSplits = [result.logs[1].args.splits[0].toNumber()];
    assert.deepEqual(eventSplits, [100]);
    assert.equal(result.logs[1].args.usdCostOfBadge.toNumber(), 1);
  });

  it('minting: should send the right amount of money to the benficiary and to the payer (paid more)', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const oneEther = web3.utils.toWei('1', 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen = BigNumber(beforeBalanceBen).plus(BigNumber(oneEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen, expectedBalBen);
  });

  it('minting: should send the right amount of money to the benficiary and to the payer (equal payment)', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const oneEther = web3.utils.toWei('1', 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen = BigNumber(beforeBalanceBen).plus(BigNumber(oneEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen, expectedBalBen);
  });

  it('minting: should fail if amount is less than specified USD (1 usd, paying 0.5 usd).', async () => {
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('0.5', 'ether') }));
  });

  it('minting: should fail if usdCost is 0', async () => {
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 0, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: should fail if exchange rate is 0', async () => {
    await oracle.setStringPrice('0');
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') }));
  });

  it('minting/burning: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft2', [accounts[2]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft2', [accounts[2]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft3', [accounts[3]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    assert.equal(await badges.totalSupply(), 5);
    await badges.burnToken(1);
    await badges.burnToken(2);
    await badges.burnToken(3);
    assert.equal(await badges.totalSupply(), 2);
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft2', [accounts[2]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    assert.equal(await badges.totalSupply(), 5);
  });

  it('minting: mint 1 token for another buyer', async () => {
    await badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const owner = await badges.ownerOf.call(1);
    assert.equal(owner, accounts[2]);
  });

  // mint: multiple mints 2
  it('minting: mint 1 badge to 2 beneficiaries, split evenly', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen1 = await web3.eth.getBalance(accounts[1]);
    const beforeBalanceBen2 = await web3.eth.getBalance(accounts[2]);
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1], accounts[2]], [50, 50], 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen1 = await web3.eth.getBalance(accounts[1]);
    const newBalBen2 = await web3.eth.getBalance(accounts[2]);
    const oneEther = web3.utils.toWei('1', 'ether');
    const pointFiveEther = web3.utils.toWei('0.5', 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen1 = BigNumber(beforeBalanceBen1).plus(BigNumber(pointFiveEther));
    const expectedBalBen2 = BigNumber(beforeBalanceBen2).plus(BigNumber(pointFiveEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen1, expectedBalBen1.toString());
    assert.equal(newBalBen2, expectedBalBen2.toString());
  });

  it('minting: mint 1 badge to 2 beneficiaries, split 33, 67.', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen1 = await web3.eth.getBalance(accounts[1]);
    const beforeBalanceBen2 = await web3.eth.getBalance(accounts[2]);
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1], accounts[2]], [33, 67], 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen1 = await web3.eth.getBalance(accounts[1]);
    const newBalBen2 = await web3.eth.getBalance(accounts[2]);
    const oneEther = web3.utils.toWei('1', 'ether');
    const point33 = BigNumber(33).div(BigNumber(100));
    const point67 = BigNumber(67).div(BigNumber(100));
    const point33Ether = web3.utils.toWei(point33.toString(), 'ether');
    const point67Ether = web3.utils.toWei(point67.toString(), 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen1 = BigNumber(beforeBalanceBen1).plus(BigNumber(point33Ether));
    const expectedBalBen2 = BigNumber(beforeBalanceBen2).plus(BigNumber(point67Ether));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen1, expectedBalBen1.toString());
    assert.equal(newBalBen2, expectedBalBen2.toString());
  });

  // mint: multiple mints 5
  it('minting: mint 1 badge to 5 beneficiaries, split evenly (20).', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen1 = await web3.eth.getBalance(accounts[1]);
    const beforeBalanceBen2 = await web3.eth.getBalance(accounts[2]);
    const beforeBalanceBen3 = await web3.eth.getBalance(accounts[3]);
    const beforeBalanceBen4 = await web3.eth.getBalance(accounts[4]);
    const beforeBalanceBen5 = await web3.eth.getBalance(accounts[5]);
    const beneficiaries = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];
    const splits = [20, 20, 20, 20, 20];
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen1 = await web3.eth.getBalance(accounts[1]);
    const newBalBen2 = await web3.eth.getBalance(accounts[2]);
    const newBalBen3 = await web3.eth.getBalance(accounts[3]);
    const newBalBen4 = await web3.eth.getBalance(accounts[4]);
    const newBalBen5 = await web3.eth.getBalance(accounts[5]);
    const oneEther = web3.utils.toWei('1', 'ether');
    const point20 = BigNumber(20).div(BigNumber(100));
    const point20Ether = web3.utils.toWei(point20.toString(), 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen1 = BigNumber(beforeBalanceBen1).plus(BigNumber(point20Ether));
    const expectedBalBen2 = BigNumber(beforeBalanceBen2).plus(BigNumber(point20Ether));
    const expectedBalBen3 = BigNumber(beforeBalanceBen3).plus(BigNumber(point20Ether));
    const expectedBalBen4 = BigNumber(beforeBalanceBen4).plus(BigNumber(point20Ether));
    const expectedBalBen5 = BigNumber(beforeBalanceBen5).plus(BigNumber(point20Ether));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen1, expectedBalBen1.toString());
    assert.equal(newBalBen2, expectedBalBen2.toString());
    assert.equal(newBalBen3, expectedBalBen3.toString());
    assert.equal(newBalBen4, expectedBalBen4.toString());
    assert.equal(newBalBen5, expectedBalBen5.toString());
  });

  it('minting: mint 1 badge to 5 beneficiaries, split not adding to 100.', async () => {
    const beneficiaries = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];
    const splits = [20, 20, 20, 20, 10];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 5 beneficiaries, split over 100.', async () => {
    const beneficiaries = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];
    const splits = [20, 20, 20, 20, 10];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 5 beneficiaries, splits are only 3 length.', async () => {
    const beneficiaries = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];
    const splits = [20, 20, 20];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 5 beneficiaries, beneficiaries are only 3 length.', async () => {
    const beneficiaries = [accounts[1], accounts[2], accounts[3]];
    const splits = [20, 20, 20, 20, 20];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 5 beneficiaries, splits are zero length.', async () => {
    const beneficiaries = [accounts[1], accounts[2], accounts[3]];
    const splits = [];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 0 beneficiaries, splits are zero length.', async () => {
    const beneficiaries = [];
    const splits = [];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 0 beneficiaries, splits are 5 length.', async () => {
    const beneficiaries = [];
    const splits = [20, 20, 20, 20, 20];
    await assertRevert(badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: mint 1 badge to 2 beneficiaries, splits are 100 & 0.', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen1 = await web3.eth.getBalance(accounts[1]);
    const beforeBalanceBen2 = await web3.eth.getBalance(accounts[2]);
    const beneficiaries = [accounts[1], accounts[2]];
    const splits = [100, 0];
    const result = await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', beneficiaries, splits, 1, { from: accounts[0], value: web3.utils.toWei('1', 'ether') });
    // eslint-disable-next-line prefer-destructuring
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    // eslint-disable-next-line prefer-destructuring
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen1 = await web3.eth.getBalance(accounts[1]);
    const newBalBen2 = await web3.eth.getBalance(accounts[2]);
    const oneEther = web3.utils.toWei('1', 'ether');
    // eslint-disable-next-line max-len
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen1 = BigNumber(beforeBalanceBen1).plus(BigNumber(oneEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen1, expectedBalBen1.toString());
    assert.equal(newBalBen2, beforeBalanceBen2);
  });

  it('minting: minting through admin', async () => {
    await badges.adminMintWithoutPayment(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[4] });
    const owner = await badges.ownerOf.call(1);
    assert.equal(owner, accounts[2]);
  });

  it('minting: mint should fail due to overflow in multiplication', async () => {
    await assertRevert(badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0], value: web3.utils.toWei('2', 'ether') }));
  });

  it('minting: should store & get all tokens by an owner', async () => {
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft2', [accounts[2]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const allBadges = await badges.getAllTokens(accounts[0]);
    const allBadgesRevised = [allBadges[0].toNumber(), allBadges[1].toNumber()];
    const array = [1, 2];
    assert.deepEqual(allBadgesRevised, array);
  });

  it('URI: should allow setting URI ID & fail when set by non-admin', async () => {
    await badges.mint(accounts[0], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIID(1, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(1);
    assert.equal(newURI, 'https://ipfs.infura.io:5001/api/v0/dag/get?arg=qmxnftqmxnftqmxnftqmxnft2');
    await assertRevert(badges.setTokenURIID(1, 'cid32', { from: accounts[1] }));
  });

  it('URI: should allow setting URI Base & fail when set by non-admin', async () => {
    await badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIBase('new_base?=', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(1);
    assert.equal(newURI, 'new_base?=qmxnftqmxnftqmxnftqmxnft');
    await assertRevert(badges.setTokenURIBase('cid32', { from: accounts[1] }));
  });

  it('URI: should allow setting URI Suffix & fail when set by non-admin', async () => {
    await badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURISuffix('.json', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(1);
    assert.equal(newURI, 'https://ipfs.infura.io:5001/api/v0/dag/get?arg=qmxnftqmxnftqmxnftqmxnft.json');
    await assertRevert(badges.setTokenURISuffix('cid32', { from: accounts[1] }));
  });

  it('URI: should revert if URI ID set for a token that doesnt exist', async () => {
    await badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await assertRevert(badges.setTokenURIID(32, 'newcid', { from: accounts[2] }));
  });

  it('URI: test transfer to 0x0 [locking] on ID, Base & Suffix setting', async () => {
    await badges.mint(accounts[2], 'qmxnftqmxnftqmxnftqmxnft', [accounts[1]], [100], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIID(1, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] });
    await badges.setTokenURIBase('new_base?=', { from: accounts[4] });
    await badges.setTokenURISuffix('.json', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(1);

    // separate test for making sure delegate wasn't overwritten and it is using correct storage
    // const delegate = await badges.testGetDelegate.call();
    // assert.equal(delegate, functions.address);


    assert.equal(newURI, 'new_base?=qmxnftqmxnftqmxnftqmxnft2.json');

    // effectively locking it, but not accidentally setting to zeroth address.
    await badgesProxy.transferOwnership('0x0000000000000000000000000000000000000001', { from: accounts[4] });
    await assertRevert(badges.setTokenURIID(1, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] }));
    await assertRevert(badges.setTokenURIBase('new_base?=', { from: accounts[4] }));
    await assertRevert(badges.setTokenURISuffix('.json', { from: accounts[4] }));
  });

  it('admin: should allow admin change & fail when setting by someone else', async () => {
    await badgesProxy.transferOwnership(accounts[1], { from: accounts[4] });
    const newAdmin = await badges.owner.call();
    assert.equal(newAdmin, accounts[1]);
    await assertRevert(badgesProxy.transferOwnership(accounts[2], { from: accounts[0] }));
  });

  it('oracle: should allow oracle to be changed & fail when changed by someone else', async () => {
    const newOracle = await testOracle.new();
    await badges.setOracle(newOracle.address, { from: accounts[4] });
    const checkOracle = await badges.oracle.call();
    assert.equal(checkOracle, newOracle.address);
    await assertRevert(badges.setOracle(oracle.address, { from: accounts[1] }));
  });
});
