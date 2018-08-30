
const { assertRevert } = require('./helpers/assertRevert');
const { assertJump } = require('./helpers/assertJump');

const ujoBadges = artifacts.require('UjoPatronageBadges');
const testOracle = artifacts.require('TestOracle');
const testInit = artifacts.require('TestInitialise.sol');

const BigNumber = require('bignumber.js');

const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
let badges;
let oracle;


contract('Patronage Badges', (accounts) => {
  beforeEach(async () => {
    const gasEstimate2 = await web3.eth.estimateGas({ data: testOracle.bytecode });
    // eslint-disable-next-line max-len
    oracle = await testOracle.new({ gas: parseInt((gasEstimate2 * 120) / 100, 0), from: accounts[1] });

    const gasEstimate = await web3.eth.estimateGas({ data: ujoBadges.bytecode });
    // eslint-disable-next-line max-len
    badges = await ujoBadges.new(accounts[4], oracle.address, { gas: parseInt((gasEstimate * 120) / 100, 0), from: accounts[4] });
  });

  it('initialization: test appropriate initialization', async () => {
    const gasEstimate = await web3.eth.estimateGas({ data: ujoBadges.bytecode });
    // eslint-disable-next-line max-len
    const gasForTestInit = await web3.eth.estimateGas({ data: testInit.bytecode });
    const deployedTest = await testInit.new({
      gas: parseInt((gasForTestInit * 120) / 100, 0),
      from: accounts[4],
    });
    const badges2 = await ujoBadges.new(accounts[4], oracle.address, {
      gas: parseInt((gasEstimate * 120) / 100, 0),
      from: accounts[4],
    });
    const setup = await badges2.setupBadges(deployedTest.address, { from: accounts[4] });
    const block = await web3.eth.getBlock(setup.receipt.blockNumber);
    // eslint-disable-next-line max-len
    // address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x9Fd5cc5E68796f08EDC54e738585227AD2B6c03F, "zdpuAsok5kEw6R8f6RTKw7Q7du8X9wXzFmHqR9Jk6NAypWkFr", "zdpuAq9k81LYpjJaSKy988Egy9V6GLMnAVSX6wLSkseRLBPUb", 0x76bc4C780Dd85558Bc4B24a4f262f4eB0bE78ca7, 5));
    assert.equal(setup.logs[0].args.tokenId, 0); // eslint-disable-line max-len
    assert.equal(setup.logs[0].args.mgcid, 'zdpuAsok5kEw6R8f6RTKw7Q7du8X9wXzFmHqR9Jk6NAypWkFr');
    assert.equal(setup.logs[0].args.nftcid, 'zdpuAq9k81LYpjJaSKy988Egy9V6GLMnAVSX6wLSkseRLBPUb');
    assert.equal(web3.utils.toChecksumAddress(setup.logs[0].args.beneficiaryOfBadge), '0x76bc4C780Dd85558Bc4B24a4f262f4eB0bE78ca7');
    assert.equal(setup.logs[0].args.usdCostOfBadge.toString(), '5');
    assert.equal(setup.logs[0].args.timeMinted.toString(), block.timestamp);
    assert.equal(web3.utils.toChecksumAddress(setup.logs[0].args.buyer), '0x9Fd5cc5E68796f08EDC54e738585227AD2B6c03F');
    assert.equal(setup.logs[0].args.issuer, accounts[4]);
    const totalTokens = await badges2.totalSupply.call();
    assert.equal(totalTokens.toNumber(), 13);
  });

  it('minting: mint and test events', async () => {
    const result = await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid1', 'qmxnftqmxnftqmxnftqmxnft1', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const block = await web3.eth.getBlock(result.receipt.blockNumber);
    assert.equal(result.logs[0].args.tokenId, 0); // eslint-disable-line max-len
    assert.equal(result.logs[0].args.mgcid, 'cidcidcidcidcidcidcidcid1');
    assert.equal(result.logs[0].args.nftcid, 'qmxnftqmxnftqmxnftqmxnft1');
    assert.equal(result.logs[0].args.beneficiaryOfBadge, accounts[1]);
    assert.equal(result.logs[0].args.usdCostOfBadge.toString(), '1');
    assert.equal(result.logs[0].args.timeMinted.toString(), block.timestamp);
    assert.equal(result.logs[0].args.buyer, accounts[0]);
    assert.equal(result.logs[0].args.issuer, accounts[0]);
  });

  it('minting: should send the right amount of money to the benficiary and to the payer', async () => {
    const beforeBalanceSender = await web3.eth.getBalance(accounts[0]);
    const beforeBalanceBen = await web3.eth.getBalance(accounts[1]);
    const result = await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    /* eslint-disable prefer-destructuring */
    const gasPrice = (await web3.eth.getTransaction(result.tx)).gasPrice;
    const gasUsed = (await web3.eth.getTransactionReceipt(result.tx)).gasUsed;
    const gasCost = gasUsed * gasPrice;
    const newBalSender = await web3.eth.getBalance(accounts[0]);
    const newBalBen = await web3.eth.getBalance(accounts[1]);
    const oneEther = web3.utils.toWei('1', 'ether');
    /* eslint-disable max-len */
    const expectedBalSender = BigNumber(beforeBalanceSender).minus(BigNumber(oneEther)).minus(BigNumber(gasCost));
    const expectedBalBen = BigNumber(beforeBalanceBen).plus(BigNumber(oneEther));
    assert.equal(newBalSender.toString(), expectedBalSender.toString());
    assert.equal(newBalBen, expectedBalBen);
  });

  it('minting: should fail if amount is less than specified USD (1 usd, paying 0.5 usd).', async () => {
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('0.5', 'ether') }));
  });

  it('minting: should fail if usdCost is 0', async () => {
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 0, { from: accounts[0], value: web3.utils.toWei('1', 'ether') }));
  });

  it('minting: should fail if exchange rate is 0', async () => {
    await oracle.setStringPrice('0');
    await assertRevert(badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') }));
  });

  it('minting/burning: create 5 tokens, burn 3, create 3 more.', async () => {
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', 'qmxnftqmxnftqmxnftqmxnft2', accounts[2], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', 'qmxnftqmxnftqmxnftqmxnft2', accounts[2], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid3', 'qmxnftqmxnftqmxnftqmxnft3', accounts[3], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    assert.equal(await badges.totalSupply(), 5);
    await badges.burnToken(0);
    await badges.burnToken(1);
    await badges.burnToken(2);
    assert.equal(await badges.totalSupply(), 2);
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid2', 'qmxnftqmxnftqmxnftqmxnft2', accounts[2], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    assert.equal(await badges.totalSupply(), 5);
  });

  it('minting: mint 1 token for another buyer', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const owner = await badges.ownerOf.call(0);
    assert.equal(owner, accounts[2]);
  });

  it('minting: minting through admin', async () => {
    await badges.adminCreateBadge(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[4] });
    const owner = await badges.ownerOf.call(0);
    assert.equal(owner, accounts[2]);
  });

  it('minting: mint should fail due to overflow in multiplication', async () => {
    await assertJump(badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0], value: web3.utils.toWei('2', 'ether') }));
  });

  it('minting: should store & get all tokens by an owner', async () => {
    await badges.mint(accounts[0], 'cid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.mint(accounts[0], 'cid2', 'qmxnftqmxnftqmxnftqmxnft2', accounts[2], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const allBadges = await badges.getAllTokens(accounts[0]);
    const allBadgesRevised = [allBadges[0].toNumber(), allBadges[1].toNumber()];
    const array = [0, 1];
    assert.deepEqual(allBadgesRevised, array);
  });

  it('URI: should allow setting URI ID & fail when set by non-admin', async () => {
    await badges.mint(accounts[0], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIID(0, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(0);
    assert.equal(newURI, 'https://ipfs.infura.io:5001/api/v0/dag/get?arg=qmxnftqmxnftqmxnftqmxnft2');
    await assertRevert(badges.setTokenURIID(0, 'cid32', { from: accounts[1] }));
  });

  it('URI: should allow setting URI Base & fail when set by non-admin', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIBase('new_base?=', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(0);
    assert.equal(newURI, 'new_base?=qmxnftqmxnftqmxnftqmxnft');
    await assertRevert(badges.setTokenURIBase('cid32', { from: accounts[1] }));
  });

  it('URI: should allow setting URI Suffix & fail when set by non-admin', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURISuffix('.json', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(0);
    assert.equal(newURI, 'https://ipfs.infura.io:5001/api/v0/dag/get?arg=qmxnftqmxnftqmxnftqmxnft.json');
    await assertRevert(badges.setTokenURISuffix('cid32', { from: accounts[1] }));
  });

  it('URI: should revert if URI ID set for a token that doesnt exist', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await assertRevert(badges.setTokenURIID(32, 'newcid', { from: accounts[2] }));
  });

  it('URI: test locks on ID, Base & Suffix setting', async () => {
    await badges.mint(accounts[2], 'cidcidcidcidcidcidcidcid', 'qmxnftqmxnftqmxnftqmxnft', accounts[1], 1, { from: accounts[2], value: web3.utils.toWei('2', 'ether') });
    await badges.setTokenURIID(0, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] });
    await badges.setTokenURIBase('new_base?=', { from: accounts[4] });
    await badges.setTokenURISuffix('.json', { from: accounts[4] });
    const newURI = await badges.tokenURI.call(0);
    assert.equal(newURI, 'new_base?=qmxnftqmxnftqmxnftqmxnft2.json');
    await badges.lockAdmin({ from: accounts[4] });
    await assertRevert(badges.setTokenURIID(0, 'qmxnftqmxnftqmxnftqmxnft2', { from: accounts[4] }));
    await assertRevert(badges.setTokenURIBase('new_base?=', { from: accounts[4] }));
    await assertRevert(badges.setTokenURISuffix('.json', { from: accounts[4] }));
  });

  it('admin: should allow admin change & fail when setting by someone else', async () => {
    await badges.changeAdmin(accounts[1], { from: accounts[4] });
    const newAdmin = await badges.admin.call();
    assert.equal(newAdmin, accounts[1]);
    await assertRevert(badges.changeAdmin(accounts[2], { from: accounts[0] }));
  });

  it('oracle: should allow oracle to be changed & fail when changed by someone else', async () => {
    const newOracle = await testOracle.new();
    await badges.setOracle(newOracle.address, { from: accounts[4] });
    const checkOracle = await badges.oracle.call();
    assert.equal(checkOracle, newOracle.address);
    await assertRevert(badges.setOracle(oracle.address, { from: accounts[1] }));
  });
});
