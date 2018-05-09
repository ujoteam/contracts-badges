pragma solidity ^0.4.21;
import "./eip721/EIP721.sol";


contract UjoAutoBadges is EIP721 {


    address public admin;
    uint256 public counter = 0;
    mapping (address => bool) public approvedHandlers;
    // mapping (uint256 => AdditionalTokenData) public additionalData;
    mapping (uint256 => address[]) public verifiedBy;

    event LogVerify(address indexed verifier, uint256 indexed tokenId);

    /* struct AdditionalTokenData {
        string cid;
        address[] beneficiaries;
        uint256[] amounts;
        address oracle;
        uint256 minted;
        address[] verifiedBy;
    }*/

    function UjoAutoBadges(address _admin) public {
        admin = _admin;
        name = "Ujo Badges";
        symbol = "UJO";
    }
    /* function getCid(uint256 _tokenId) public view returns (string) {
        return additionalData[_tokenId].cid;
    }

    function getBeneficiaries(uint256 _tokenId) public view returns (address[]) {
        return additionalData[_tokenId].beneficiaries;
    }

    function getAmounts(uint256 _tokenId) public view returns (uint256[]) {
        return additionalData[_tokenId].amounts;
    }

    function getOracle(uint256 _tokenId) public view returns(address) {
        return additionalData[_tokenId].oracle;
    }

    function getMinted(uint256 _tokenId) public view returns(uint256) {
        return additionalData[_tokenId].minted;
    }*/

    function getVerifiers(uint256 _tokenId) public view returns (address[]) {
        return verifiedBy[_tokenId];
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

    modifier onlyApprovedHandler() {
        require(approvedHandlers[msg.sender]);
        _;
    }

    /*
    Since badges are automatically created from any release purchase,
    any purchase that does not conform to the expected criteria set in the off-chain
    license is not regarded as legitimate. In short term, Ujo, verifies this off-chain.
    However, over time, anyone can submit verifications & accordingly check on-chain if the
    badges were issued according to the right criteria.
    */
    function verifyBadge(uint256 _tokenId) public {
        verifiedBy[_tokenId].push(msg.sender);
        emit LogVerify(msg.sender, _tokenId);
    }

    function setApprovedHandler(address _handler, bool _state) public onlyAdmin {
        approvedHandlers[_handler] = _state;
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    function setTokenURI(uint256 _tokenID, string URI) public {
        require(msg.sender == admin);
        tokenURIs[_tokenID] = URI;
    }

    function receiveNotification(string _cid,
    address _oracle,
    address _buyer,
    address[] _beneficiaries,
    uint256[] _amounts) public payable onlyApprovedHandler {
        addToken(_buyer, counter);
        /* AdditionalTokenData memory aData;
        aData.cid = _cid;
        aData.beneficiaries = _beneficiaries;
        aData.amounts = _amounts;
        aData.oracle = _oracle;
        aData.minted = now; //solhint-disable-line not-rely-on-time
        additionalData[counter] = aData;*/

        emit Transfer(0, _buyer, counter);
        counter += 1; // every new token gets a new ID
    }

    function burnToken(uint256 _tokenId) public {
        require(ownerOfToken[_tokenId] == msg.sender); //token should be in control of owner
        removeToken(msg.sender, _tokenId);
        emit Transfer(msg.sender, 0, _tokenId);
    }
}
