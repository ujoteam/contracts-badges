## Collectible Badges

[![codecov](https://codecov.io/gh/UjoTeam/contracts-badges/branch/master/graph/badge.svg)](https://codecov.io/gh/UjoTeam/contracts-badges)  
[![CircleCI](https://circleci.com/gh/UjoTeam/contracts-badges.svg?style=svg)](https://circleci.com/gh/UjoTeam/contracts-badges)  

These contracts manages [ERC721 (Non-Fungible Token)](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md) Badges that are minted for fans. There's Auto Badges & Patronage Badges.

## Patronage Badges

The goal of Patronage Badges is to have a proof-of-fandom towards a particular creator (in our case: musicians). Any fan can buy a badge from a creator and have it be minted. They are infinite.

The Patronage Badges are modular & flexible enough that it can be used by anyone wishing to issue patronage badges (not just for Ujo).

#### Minting using ETH

```function mint(address _buyer, string _mgCid, string _nftCid, address _beneficiary, uint256 _usdCost) public payable```

To mint a badge, you have to specify the buyer address, the MusicGroup CID, the NFT CID, the beneficiary and the denomination in USD of the badge. The buyer address means one can buy a badge for someone else. In order to create badge that works neatly and can be displayed in ERC721-standard websites, the NFT CID, specifically needs to conform to a specific format (found here: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md). We add additional fields relevant to Patronage Badges. An example is:

```
{
  "MusicGroup":"zdpuAw5tNTEmz3BuyF9YveBN3VTi3V7ow8XxLRLcF8XyjeSCm",
  "beneficiaryOfBadge":"0xe8f08d7dc98be694cda49430ca01595776909eac",
  "description":"A collectible patronage badge for Schwartz",
  "image":"https://www.dev.ujomusic.com/image/600x600/https://ipfs.infura.io/ipfs/QmU5PAa15zVKSe1A2diSbK4cneo5Q2PwtShDuf214nkkm1",
  "name":"Schwartz Patronage Badge",
  "usdCostOfBadge":5
}
```

In the function, it checks whether the ETH sent to it is enough by checking with a built-in price oracle (maintained by Ujo).

To retrieve the data associated with the badge, you query the event by the indexed tokenId.

```event LogBadgeMinted(uint256 indexed tokenId, string mgcid, string nftcid, address indexed beneficiaryOfBadge, uint256 indexed usdCostOfBadge, uint256 timeMinted, address buyer, address issuer);
```

This allows you to easily fetch the rest of the log's information and have the rest of the information available.

### Using Patronage Badges in Your Gallery, Dapp or NFT Exchange

Since we use ERC721 it is possible to transfer, display and interact with the badge in different dapps, like OpenSea or Nifty Gallery. In these applications, displaying the badge only requires that you fetch the information from IPFS in order to do so. It follows the standard as thus it is simple to retrieve the information.

### Future Improvements & Decentralization

The badges conform to a proxy, upgradeable standard for the time being. This means that the badges can be upgraded with new functionality over time. We want to in the short term, allow this so that we can add new ways to mint into the future: such as usage of DAI or other ERC20 tokens.

Currently, we also have control over the tokenURI base [if it needs to change into the future], and the oracle used in the contract.

The NFT CID has a URI that contains an Ujo Music address. Ideally, we would simply be using the content hash and retrieve as such. If in the future that Ujo would remove its API, the badges would still work if the data was persisted on IPFS, given that the content hash is scraped off from the URL.

In the future, when we feel that it's sufficient, we will remove any owner or admin functionality from the Badges Proxy.

## Auto Badges

Auto Badges are minted automatically from a given handler [which handles licensing payments].   

These only accept payments from an approved handler [set by an admin].

These badges are currently being regardless whether the criteria is correct in the metadata or not. Thus, some of the badges might not be legitimate. Currently, Ujo will off-chain verify this. However, in the future, we will verify the badges manually, which acts a proof that the payment was correctly issued.
