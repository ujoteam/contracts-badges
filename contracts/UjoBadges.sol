pragma solidity 0.4.19;
import "./ERC721.sol";


contract UjoBadges is ERC721 {

    address public admin;
    uint256 public counter = 0;
    mapping (address => bool) public approvedHandlers;
    mapping (uint256 => AdditionalTokenData) public additionalData;

    struct AdditionalTokenData {
        string cid;
        address[] beneficiaries;
        uint256[] amounts;
        address oracle;
        uint256 minted;
    }

    function UjoBadges(address _admin) public {
        admin = _admin;
    }

    function getCid(uint256 _tokenId) public view returns (string) {
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
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyApprovedHandler() {
        require(approvedHandlers[msg.sender]);
        _;
    }

    function setApprovedHandler(address _handler, bool _state) public onlyAdmin {
        approvedHandlers[_handler] = _state;
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }

    function setMetadata(uint256 _tokenId, string _metadata) public onlyAdmin {
        tokenMetadata[_tokenId] = _metadata;
    }

    function receiveNotification(string _cid,
    address _oracle,
    address _buyer,
    address[] _beneficiaries,
    uint256[] _amounts) public payable onlyApprovedHandler {
        addToken(_buyer, counter);
        AdditionalTokenData memory aData;
        aData.cid = _cid;
        aData.beneficiaries = _beneficiaries;
        aData.amounts = _amounts;
        aData.oracle = _oracle;
        aData.minted = now; //solhint-disable-line not-rely-on-time
        additionalData[counter] = aData;

        Transfer(0, _buyer, counter);
        totalSupply += 1;
        counter += 1; // every new token gets a new ID
    }

    function burnToken(uint256 _tokenId) public {
        require(tokenOwner[_tokenId] == msg.sender); //token should be in control of owner
        removeToken(msg.sender, _tokenId);
        Transfer(msg.sender, 0, _tokenId);
        totalSupply -= 1;
    }
}
