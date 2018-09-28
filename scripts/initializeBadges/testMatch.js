/*
This was used to double check that this init script generates the same objects to the front-end.
First, the front-end was deployed and a badge minted.
Then it was pulled from rinkeby and compared to a local MG.
If the hashes match on the objects
*/

const axios = require('axios');

const getDataFromApi = async () => {
  // const expectedNftCid = 'zdpuArkNzyyxw8zYV83pcE53sr7JzezRKzmGbBNn7kbaoZPvT';
  // const buyer = '0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD';
  const beneficiaryOfBadge = '0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD';
  // const beneficiaryOfBadge = '0x374bd185ee19fd9f8682eb875e5d0546a8d58cdd';

  // 1 == Simon Local
  const { data } = await axios.get('http://localhost:9001/api/musicgroups/1');
  // console.log(data);
  const objectForIPFS = {
    name: `${data.name} Patronage Badge`,
    description: `A collectible patronage badge for ${data.name}`,
    image: `https://www.ujomusic.com/image/600x600/${data.image.contentURL}`,
    beneficiaries: [{ address: beneficiaryOfBadge, split: 100 }],
    MusicGroup: data.cid,
    usdCostOfBadge: 5,
  };

  const response = await axios({
    method: 'post',
    url: 'https://api.dev.ujomusic.com/api/dag/put',
    data: JSON.stringify(objectForIPFS),
  });
  console.log('infura response');
  console.log(response);
  return objectForIPFS;
};

const initialize = async () => {
  const formattedData = await getDataFromApi();
  console.log(formattedData);
};

initialize();
