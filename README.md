## Collectible Badges

[![codecov](https://codecov.io/gh/UjoTeam/contracts-badges/branch/master/graph/badge.svg)](https://codecov.io/gh/UjoTeam/contracts-badges)  
[![CircleCI](https://circleci.com/gh/UjoTeam/contracts-badges.svg?style=svg)](https://circleci.com/gh/UjoTeam/contracts-badges)  

These contracts manages [ERC721 (Non-Fungible Token)](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md) Badges that are minted for fans. There's Auto Badges & Patronage Badges.

## Patronage Badges

The goal of Patronage Badges is to have a proof-of-fandom towards a particular creator (in our case: musicians). Any fan can buy a badge from a creator and have it be minted. They are infinite.

The Patronage Badges are modular & flexible enough that it can be used by anyone wishing to issue patronage badges. In patronage badges, it's valuable to prove one owns an early badge (eg, a fan with badge #5 is more awesome than having badge #231). Thus, for any particular creator, it keeps track of how many badges are minted.

A Patronage Badge consists of 3 components:

1) The CID identifier [currently an IPFS [CID](https://github.com/ipld/cid)] which contains the link towards its metadata.  
2) The address of beneficiary being paid.  
3) The USD amount of the badge.


#### Minting

```function mint(address _buyer, string _cid, address _beneficiary, uint256 _usdCost) public payable```

To mint a badge, you have to specify the buyer, the CID, the beneficiary and the denomination of the badge. The buyer address means one can buy a badge for someone else.

In the function, it checks whether the ETH sent to it is enough by checking with a built-in price oracle (maintained by Ujo).

In other words, given the CID ```zefghijklmnop``` (that represents the band Radiohead), paying towards account ```0x1c3b00da``` for a ```$5```, it will increment a badge whenever someone buys for those three combinations.

To keep costs down, none of this additional information is stored. It is however logged in an event log with the ```tokenId``` being indexed. This allows you to fetch the rest of the log's information and have the rest of the information available (such as the ```badgeNumber```).

The ```tokenId``` that's generated is a keccak256 hash of [```CID```, ```beneficiary```, ```denomination```, ```totalAlreadyMintedForThisCombination```].

#### 1) [Content-Identifiers](https://github.com/ipld/cid) & ```tokenURI```

```CID is a format for referencing content in distributed information systems.```

In the smart contract, it's just a ```string``` value. Additionally when minting, it's also stored as the ```tokenURI```.

It is thus, however possible to just a ```string``` instead of a CID, however, it's not recommended as anyone looking up the badge would not be able to find its metadata.

When one has the CID, one can then query IPFS to retrieve the metadata [name of group, image, etc].

For example: to retrieve a badge bought from Tom Finster, it uses the following MusicGroup hash: ```zdpuAs4oSTUXz9wJX8mY7LTztmrG6i6p1hjmMELgBV9iS1KdG```. Here's the related IPFS metadata information that is used to populate the badge information: https://ipfs.infura.io:5001/api/v0/dag/get?arg=zdpuAs4oSTUXz9wJX8mY7LTztmrG6i6p1hjmMELgBV9iS1KdG

#### 2) Beneficiary Address

The beneficiary is the address to whom the payment should be sent towards. This is usually retrieved by finding the corresponding Person metadata object from IPFS along with its ethereumAddress embedded in it.

If the beneficiary's address changes, it will start minting from the start again. This is necessary to include because one could mint tokens for a certain CID, but send the payments to oneself, "fraudulently" minting badges (with the artist not receiving the money).

#### 3) USD amount (& Price Oracle)

The badges are based on specific denominations. You must specify this USD amount when minting. In doing so, it checks with a price oracle to see if the ETH sent with it, is enough to pay for the badge.

The oracle contract used is set by an administrator. The oracle is currently maintained by Ujo.

### Future Improvements

- Supporting DAI & other ERC20 tokens for minting a badge.
- Making the oracle an optional part of the definition in order to further decentralize it. For example, if Ujo decides to not maintain the oracle anymore, then you can't mint badges effectively. By adding the oracle to the ```mint``` function, anyone can use any oracle. However, for the time being, you don't want to also start incrementing new badges for every time an oracle might change. So for now, it's still a trade-off.

## Auto Badges

Auto Badges are minted automatically from a given handler   

These only accept payments from an approved handler [set by an admin].   

These badges are currently being regardless whether the criteria is correct in the metadata or not. Thus, some of the badges might not be legitimate. Currently, Ujo will off-chain verify this. However, in the future, we will verify the badges manually, which acts a proof that the payment was correctly issued.
