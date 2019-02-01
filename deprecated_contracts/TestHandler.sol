pragma solidity ^0.4.21;
import "./UjoAutoBadges.sol"; // todo, change to interface.


contract TestHandler {

    UjoAutoBadges public badges;

    function TestHandler(address _badges) public {
        badges = UjoAutoBadges(_badges);
    }

    function testSimplePayment(address _minter) public {
        uint256[] memory amounts;
        address[] memory beneficiaries;
        badges.receiveNotification("cid", 0, _minter, beneficiaries, amounts);
    }

    function testFullPayment(string _cid, address _oracle, address _minter, address[] _beneficiaries, uint256[] _amounts) public {
        // (cid, oracle, buyer, addresses, amounts)
        // general validation would usually be here before forwarding.
        badges.receiveNotification(_cid, _oracle, _minter, _beneficiaries, _amounts);
    }
}
