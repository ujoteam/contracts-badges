pragma solidity ^0.4.24;
import "./eip721/EIP721.sol";
import "./utils/SafeMath.sol";
import "./IUSDETHOracle.sol";

/*
Old Patronage Badges.
Does not contain a tokenURI refactor.
And does not contain Badge Number refactor.
Deprecated on 22 Aug 2018.
DO NOT USE THIS.
*/

contract OldUjoPatronageBadges is EIP721 {
    using SafeMath for uint256;

    // hash(cid -> beneficiary -> usd) -> total
    mapping (bytes32 => uint256) public totalMintedBadgesPerCombination;

    event LogBadgeMinted(uint256 indexed tokenId, string cid, address indexed beneficiaryOfBadge, uint256 usdCostOfBadge, uint256 badgeNumber, address indexed buyer, address issuer);

    address public admin;

    IUSDETHOracle public oracle;

    constructor(address _admin, address _initialOracle) public {
        admin = _admin; // sets oracle used.
        name = "Patronage Badges";
        symbol = "PATRON";
        oracle = IUSDETHOracle(_initialOracle);
    }

    function setOracle(address _oracle) public onlyAdmin {
        oracle = IUSDETHOracle(_oracle);
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

    // cid == any IPFS object
    function mint(address _buyer, string _cid, address _beneficiary, uint256 _usdCost) public payable {
        uint256 exchangeRate = oracle.getUintPrice();
        require(exchangeRate > 0);
        require(_usdCost > 0);

        // note: division is not done with SafeMath because 1 ether in Solidity is int_const
        // also: impossible to over/underflow
        uint256 usdCostInWei = (1 ether / exchangeRate).mul(_usdCost);
        require(msg.value >= usdCostInWei);

        bytes32 hashedCombination = keccak256(_cid, _beneficiary, _usdCost);
        uint256 totalMinted = totalMintedBadgesPerCombination[hashedCombination];
        uint256 tokenId = uint256(keccak256(_cid, _beneficiary, _usdCost, totalMinted));

        tokenURIs[tokenId] = _cid;

        addToken(_buyer, tokenId);
        emit LogBadgeMinted(tokenId, _cid, _beneficiary, _usdCost, totalMinted, _buyer, msg.sender);

        totalMintedBadgesPerCombination[hashedCombination] = totalMinted.add(1);

        //  check if paid enough through oracle price
        //  Send back remainder.
        if (msg.value > usdCostInWei) {
            msg.sender.transfer(msg.value - usdCostInWei);
        }

        _beneficiary.transfer(usdCostInWei);
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    // URI is the CID
    // solhint-disable-next-line func-param-name-mixedcase
    function setTokenURI(uint256 _tokenID, string URI) public tokenExists(_tokenID) {
        require(msg.sender == admin);
        tokenURIs[_tokenID] = URI;
    }

    function burnToken(uint256 _tokenId) public {
        require(ownerOfToken[_tokenId] == msg.sender); //token should be in control of owner
        removeToken(msg.sender, _tokenId);
        emit Transfer(msg.sender, 0, _tokenId);
    }
}
