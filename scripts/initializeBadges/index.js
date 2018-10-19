/*
A once-off script to port over the minted badges from the old Patronage Badges
to the new Patronage Badges.
*/

const fs = require('file-system');
const Web3 = require('web3');
const axios = require('axios');

const ujoBadges = require('../../build/contracts/OldUjoPatronageBadges.json');

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

const promisifedGetPastEvents = (contract, event, options) => new Promise((resolve, reject) => {
  contract.getPastEvents(event, options, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

const getListOfBadges = async () => { // eslint-disable-line consistent-return
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

const getDataFromApi = async formattedData =>
  Promise.all(formattedData.map(async (singleBadgeData) => {
    const { mgCid, beneficiaryOfBadge, buyer } = singleBadgeData; // eslint-disable-line object-curly-newline, max-len
    const { data } = await axios.get(`https://www.ujomusic.com/api/musicgroups/cid/${mgCid}`);
    console.log(beneficiaryOfBadge);
    const objectForIPFS = {
      name: `${data.name} Patronage Badge`,
      description: `A collectible patronage badge for ${data.name}`,
      image: `https://www.ujomusic.com/image/600x600/${data.image.contentURL}`,
      beneficiaries: [{ address: beneficiaryOfBadge, split: 100 }],
      MusicGroup: data.cid,
      usdCostOfBadge: 5,
      // buyer will be removed when pushing to ipfs, but we need to retain reference to it
      buyer,
    };
    return objectForIPFS;
  }));

const pinToInfura = async (formattedData) => {
  const dataWithCids = [];

  /*
    sendRequest is implemented recursively because we can
    much more easily throttle our calls to infura using setTimeout
    in case we hit their rate limit
  */
  const sendRequest = async (dataArray) => {
    if (dataArray.length) {
      const { buyer } = dataArray[dataArray.length - 1];
      delete dataArray[dataArray.length - 1].buyer; // eslint-disable-line no-param-reassign
      const response = await axios({
        method: 'post',
        url: 'https://api.dev.ujomusic.com/api/dag/put',
        data: JSON.stringify(dataArray[dataArray.length - 1]),
      });
      dataWithCids.push({ ...dataArray[dataArray.length - 1], nftCid: response.data, buyer });
      dataArray.pop();
      await sendRequest(dataArray);
    }
  };

  await sendRequest(formattedData);

  return dataWithCids;
};

const writeData = async (dataWithCids) => {
  let functionsToWrite = '// function adminMintWithoutPayment(address _buyer, string _nftCid, address[] _beneficiaries, uint256[] _splits, uint256 _usdCost)\n';
  dataWithCids.forEach(({
    buyer, beneficiaries, nftCid,
  }) => {
    functionsToWrite += `beneficiaries[0] = address(${beneficiaries[0].address});address(this).delegatecall(abi.encodeWithSignature("adminMintWithoutPayment(address,string,address[],uint256[],uint256)", ${buyer}, "${nftCid}", beneficiaries, splits, 5));\n`;
  });

  fs.writeFile('scripts/initializeBadges/createBadges.txt', functionsToWrite, (err) => {
    if (!err) console.log('done');
    else console.log('Error writing your file to your fs');
  });
};

const initialize = async () => {
  const txData = await getListOfBadges();
  const formattedData = await getDataFromApi(txData);
  const dataWithCids = await pinToInfura(formattedData);
  await writeData(dataWithCids);
};

initialize();
