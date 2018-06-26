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
        return stringToUint(ethUsdString);
    }

    function stringToUint(string s) public constant returns (uint) {
        bytes memory b = bytes(s);
        uint result = 0;
        for (uint i = 0; i < b.length; i++) { 
            if (b[i] >= 48 && b[i] <= 57) {
                result = result * 10 + (uint(b[i]) - 48);
            }
        }
        return result;
    }
}
