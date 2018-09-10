pragma solidity ^0.4.24;
import "./Proxy.sol";
import "./Ownable.sol";

/*
Contains refactor of tokenURI
and badge numbers
*/

contract UjoPatronageBadges is Proxy, Ownable {

    /* --- */
    address internal delegate;
    /* --- */

    // solhint-disable-next-line visibility-modifier-order
    constructor(address _owner, address _delegate) Ownable(_owner) public {
        delegate = _delegate; //starting delegate.
    }

    /* upgrade or change functions of badges */
    function setDelegate(address _delegate) public onlyOwner {
        delegate = _delegate;
    }

    function _implementation() internal view returns (address) {
        return delegate;
    }
}
