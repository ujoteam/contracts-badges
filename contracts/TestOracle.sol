/*
Used in testing to see if the Handler properly fetches it.
Relies on getPrice() to return a string.
*/
pragma solidity ^0.5.0;


contract TestOracle {
    uint public price = 1;

    function setPrice(uint _newPrice) public {
        price = _newPrice;
    }

    function getUintPrice() public view returns (uint) {
        return price;
    }
}
