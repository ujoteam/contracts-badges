pragma solidity ^0.4.24;
import "./eip721/EIP721.sol";
import "./utils/SafeMath.sol";
import "./utils/strings.sol";
import "./IUSDETHOracle.sol";

/*
Contains refactor of tokenURI
and badge numbers
*/

contract UjoPatronageBadges is EIP721 {
    using SafeMath for uint256;
    using strings for *;

    // hash(mgcid -> nftcid -> beneficiary -> usd) -> total
    mapping (bytes32 => uint256) public totalMintedBadgesPerCombination;

    event LogBadgeMinted(uint256 indexed tokenId, string mgcid, string nftcid, address indexed beneficiaryOfBadge, uint256 usdCostOfBadge, uint256 badgeNumber, address indexed buyer, address issuer);

    address public admin;
    bool public locked = false;

    string public tokenURIBase;
    string public tokenURISuffix;
    mapping (uint256 => string) public tokenURIIDs;

    // uint256 public exchangeRate = 0;

    IUSDETHOracle public oracle;

    constructor(address _admin, address _initialOracle, address _initialiseBadges) public {
        admin = _admin; // sets oracle used.
        name = "Patronage Badges";
        symbol = "PATRON";
        tokenURIBase = "https://ipfs.infura.io:5001/api/v0/dag/get?arg=";
        tokenURISuffix = "";
        oracle = IUSDETHOracle(_initialOracle);

        // this issues a delegatecall in case there needs to be an initial setup the badges.
        // eg, creating 100 initial badges for example.
        // _initialiseBadges.delegatecall(bytes4(keccak256(abi.encode("initialise()"))));
    }

    // overload inherited tokenURI
    function tokenURI(uint256 _tokenId) external view returns (string) {
        return tokenURIBase.toSlice().concat(tokenURIIDs[_tokenId].toSlice()).toSlice().concat(tokenURISuffix.toSlice());
    }

    // additional helper function not in EIP721.
    function getAllTokens(address _owner) public view returns (uint256[]) {
        uint size = ownedTokens[_owner].length;
        uint[] memory result = new uint256[](size);
        for (uint i = 0; i < size; i++) {
            result[i] = ownedTokens[_owner][i];
        }
        return result;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier notLocked() {
        require(!locked);
        _;
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    function setOracle(address _oracle) public onlyAdmin {
        oracle = IUSDETHOracle(_oracle);
    }

    // URI is the CID
    // solhint-disable-next-line func-param-name-mixedcase
    function setTokenURIID(uint256 _tokenID, string _newID) public onlyAdmin notLocked tokenExists(_tokenID) {
        tokenURIIDs[_tokenID] = _newID;
    }

    function setTokenURIBase(string _newURIBase) public onlyAdmin notLocked {
        tokenURIBase = _newURIBase;
    }

    function setTokenURISuffix(string _newURISuffix) public onlyAdmin notLocked {
        tokenURISuffix = _newURISuffix;
    }

    function lockAdmin() public onlyAdmin {
        locked = true; // lock admin functionality forever.
    }

    function mint(address _buyer, string _mgCid, string _nftCid, address _beneficiary, uint256 _usdCost) public payable returns (uint256 tokenId) {
        processPayment(_beneficiary, _usdCost);
        return createBadge(_buyer, _mgCid, _nftCid, _beneficiary, _usdCost);
    }

    function burnToken(uint256 _tokenId) public {
        require(ownerOfToken[_tokenId] == msg.sender); //token should be in control of owner
        removeToken(msg.sender, _tokenId);
        emit Transfer(msg.sender, 0, _tokenId);
    }

    /* internal functions */
    function processPayment(address _beneficiary, uint256 _usdCost) internal {
        uint256 exchangeRate = oracle.getUintPrice();

        require(exchangeRate > 0);
        require(_usdCost > 0);
        // note: division is not done with SafeMath because 1 ether in Solidity is int_const
        // also: impossible to over/underflow
        uint256 usdCostInWei = (1 ether / exchangeRate).mul(_usdCost);
        require(msg.value >= usdCostInWei);

        //  check if paid enough through oracle price
        //  Send back remainder.
        if (msg.value > usdCostInWei) {
            msg.sender.transfer(msg.value - usdCostInWei);
        }

        _beneficiary.transfer(usdCostInWei);
    }

    function createBadge(address _buyer, string _mgCid, string _nftCid, address _beneficiary, uint256 _usdCost) internal returns (uint256) {
        bytes32 _hash = keccak256(abi.encodePacked(_mgCid, _nftCid, _beneficiary, _usdCost));
        totalMintedBadgesPerCombination[_hash] = totalMintedBadgesPerCombination[_hash].add(1);
        uint256 badgeNumber = totalMintedBadgesPerCombination[_hash];
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_mgCid, _nftCid, _beneficiary, _usdCost, badgeNumber)));

        tokenURIIDs[tokenId] = _nftCid;

        addToken(_buyer, tokenId);
        emit LogBadgeMinted(tokenId, _mgCid, _nftCid, _beneficiary, _usdCost, badgeNumber, _buyer, msg.sender);
        return tokenId;
    }
}
