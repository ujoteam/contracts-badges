/*
Used in testing to see if the Handler properly fetches it.
Relies on getPrice() to return a string.
*/
pragma solidity ^0.4.21;


contract TestOracle {
    uint public price = 1; // 1 eth = 1 usd for simplicity of testing.
    uint256 public lastUpdated;

    function TestOracle() public {
        lastUpdated = now; // solhint-disable-line not-rely-on-time
    }

    function getUintPrice() public view returns (uint) {
        return price;
    }
    
    function setPrice(uint _price) public {
        lastUpdated = now; // solhint-disable-line not-rely-on-time
        price = _price;
    }
}
