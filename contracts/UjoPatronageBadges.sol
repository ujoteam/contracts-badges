pragma solidity ^0.4.21;
import "./eip721/EIP721.sol";
import "./utils/strings.sol";
import "../node_modules/ujo-contracts-oracle/contracts/IUSDETHOracle.sol";

contract UjoPatronageBadges is EIP721 {
    using strings for *;
    // enumeration

    // cid -> beneficiary -> total
    mapping (string => mapping(address => uint256)) totalMintedBadgesPerCidAndBeneficiary;

    // token ID -> number towards combo of CID + beneficiary.
    mapping (uint256 => uint256) public badgeNumber;

    // token ID -> what CID it pertains to.
    mapping (uint256 => string) public cidOfBadge;

    // token ID -> what beneficiary it pertains
    mapping (uint256 => address) public beneficiaryOfBadge;

    address public admin;

    IUSDETHOracle public oracle;

    function UjoPatronageBadges(address _admin) public {
        admin = _admin; // sets oracle used.
        name = "Ujo Patronage Badges";
        symbol = "UJOP";
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
    function mint(string _cid, address _beneficiary) public payable {
        //  check if paid enough through oracle price
        //  only type now is: > $5 via oracle. Send back remainder.

        //  forward ETH equivalent to $5.
        //  send back remainder.
        // if less than $5, revert.

        // compute badge information & mint it.
        //price of one wei for calculation purposes
        uint val = oracle.getUintPrice();
        uint five = (1 ether /val) * 5;
        require(msg.value >= five);
        _beneficiary.transfer(five);
        msg.sender.transfer(msg.value - five);
        uint256 tokenId = computeID(_cid, _beneficiary, totalMintedBadgesPerCidAndBeneficiary[_cid][_beneficiary]);
        badgeNumber[tokenId] = totalMintedBadgesPerCidAndBeneficiary[_cid][_beneficiary];
        cidOfBadge[tokenId] = _cid;
        beneficiaryOfBadge[tokenId] = _beneficiary;
        tokenURIs[tokenId] = _cid;
        addToken(msg.sender, tokenId);

        totalMintedBadgesPerCidAndBeneficiary[_cid][_beneficiary] += 1;
    }


    function computeID(string _cid, address _beneficiary, uint256 _counter) public returns (uint256) {
        // determine unique uint ID combining the CID with the number per CID.
        // this is to ensure that we also track the number of badges per artist.
        // steps as it unfolds:
        // 1) turn integer counter into a string
        // 2) turn beneficiary address into a string
        // 3) concatenate the cid + beneficiary + counter
        // 4) get a hash of the combination.
        // 5) get integer value of hash.
        return uint256(keccak256(_cid.toSlice().concat(bytes32ToString(bytes32(_counter)).toSlice()).toSlice().concat(toString(_beneficiary).toSlice()))); // concatenate cid + counter + beneficiary
    }

    function toString(address x) returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    // URI is the CID
    function setTokenURI(uint256 _tokenID, string URI) public {
        require(msg.sender == admin);
        tokenURIs[_tokenID] = URI;
    }

    function burnToken(uint256 _tokenId) public {
        require(ownerOfToken[_tokenId] == msg.sender); //token should be in control of owner
        removeToken(msg.sender, _tokenId);
        emit Transfer(msg.sender, 0, _tokenId);
    }

    function bytes32ToString (bytes32 data) internal returns (string) {
        bytes memory bytesString = new bytes(32);
        for (uint j=0; j < 32; j++) {
            byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[j] = char;
            }
        }
        return string(bytesString);
    }
}
