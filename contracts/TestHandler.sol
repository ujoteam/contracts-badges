pragma solidity 0.4.19;
import "./UjoBadges.sol"; // todo, change to interface.


contract TestHandler {

    UjoBadges public badges;

    function TestHandler(address _badges) public {
        badges = UjoBadges(_badges);
    }

    function createToken(address _minter) public {
        // usually payment validation logic goes here.
        uint256[] memory amounts;
        address[] memory adds;
        badges.receiveNotification("cid", 0, _minter, adds, amounts);
    }
}
