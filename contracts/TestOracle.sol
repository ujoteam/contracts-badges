/*
Used in testing to see if the Handler properly fetches it.
Relies on getPrice() to return a string.
*/
pragma solidity ^0.4.21;


contract TestOracle {
    string public ethUsdString = "1";

    function setStringPrice(string _newPrice) public {
        ethUsdString = _newPrice;
    }

    function getUintPrice() public returns (uint) {
        return 1;
    }
}
