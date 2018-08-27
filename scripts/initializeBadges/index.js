const fs = require('file-system');
const Web3 = require('web3');
const axios = require('axios');

const ujoBadges = require('../../build/contracts/UjoPatronageBadges.json');

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

const promisifedGetPastEvents = (contract, event, options) => new Promise((resolve, reject) => {
  contract.getPastEvents(event, options, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

const getListOfBadges = async () => {
  console.log('Instantiating badge contract and getting events');
  const patronageBadgeInstance = new web3.eth.Contract(ujoBadges.abi, '0xc45e027f0f9d7e90e612be02d4e710a632a9dba9');

  try {
    const eventData = await promisifedGetPastEvents(patronageBadgeInstance, 'LogBadgeMinted', { fromBlock: '5985366', toBlock: 'latest' });
    console.log('Successfully retrieved your contracts events');
    return eventData.map(({ returnValues }) => {
      const {
        buyer, beneficiaryOfBadge, cid, usdCostOfBadge,
      } = returnValues;
      return {
        buyer, beneficiaryOfBadge, mgCid: cid, usdCostOfBadge,
      };
    });
  } catch (err) {
    console.log('ERROR GETTING EVENT DATA: ', err);
  }
};

const pinToInfura = async (formattedData) => {
  const dataWithCids = [];

  /*
    sendRequest is implemented recursively because we can
    much more easily throttle our calls to infura using setTimeout
    in case we hit their rate limit
  */
  const sendRequest = async (dataArray) => {
    if (dataArray.length) {
      const response = await axios({
        method: 'post',
        url: 'https://api.dev.ujomusic.com/api/dag/put',
        data: JSON.stringify(dataArray[dataArray.length - 1]),
      });

      dataWithCids.push({ ...dataArray[dataArray.length - 1], nftCid: response.data });
      dataArray.pop();
      await sendRequest(dataArray);
    }
  };

  await sendRequest(formattedData);

  return dataWithCids;
};

const writeData = async (dataWithCids) => {
  let functionsToWrite = '// function createBadge(address _buyer, string _mgCid, string _nftCid, address _beneficiary, uint256 _usdCost)\n';
  dataWithCids.forEach(({
    buyer, beneficiaryOfBadge, mgCid, nftCid,
  }) => {
    functionsToWrite += `createBadge("${buyer}", "${mgCid}", "${nftCid}", "${beneficiaryOfBadge}", 5);\n`;
  });

  fs.writeFile('scripts/initializeBadges/createBadges.txt', functionsToWrite, (err) => {
    if (!err) console.log('done');
    else console.log('Error writing your file to your fs');
  });
};

const initialize = async () => {
  const txData = await getListOfBadges();
  const dataWithCids = await pinToInfura(txData);
  await writeData(dataWithCids);
};

initialize();
