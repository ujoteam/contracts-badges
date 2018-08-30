pragma solidity ^0.4.24;

/*
This re-adds badges that were minted in:
https://etherscan.io/address/0xc45e027f0f9d7e90e612be02d4e710a632a9dba9
13 badges
Up to: https://etherscan.io/tx/0x7040fe01a5c0044ba86d04a73cd38c7ff5746fa7517985adae0120d2374013b5
*/

// solhint-disable avoid-low-level-calls
contract InitBadges {
    function initialise() public {
        // function createBadge(address _buyer, string _mgCid, string _nftCid, address _beneficiary, uint256 _usdCost)
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x9Fd5cc5E68796f08EDC54e738585227AD2B6c03F, "zdpuAsok5kEw6R8f6RTKw7Q7du8X9wXzFmHqR9Jk6NAypWkFr", "zdpuAq9k81LYpjJaSKy988Egy9V6GLMnAVSX6wLSkseRLBPUb", 0x76bc4C780Dd85558Bc4B24a4f262f4eB0bE78ca7, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x1318d3420b0169522eB8F3EF0830aceE700A2eda, "zdpuAoPsAtLav11fkmN59AXtTb4syxM8XxdrzL7Wb7gJv6R6D", "zdpuAvGdiy6k6wPMLewFZ4saugkLKxLPPvsS8LbFrbPP1Wdk7", 0x2ABfE45394Df8dCEA4BC8006bab2cc5A850a9305, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x07A93218F692e18Dd77D693D84568A5042df667b, "zdpuAoPsAtLav11fkmN59AXtTb4syxM8XxdrzL7Wb7gJv6R6D", "zdpuAvGdiy6k6wPMLewFZ4saugkLKxLPPvsS8LbFrbPP1Wdk7", 0x2ABfE45394Df8dCEA4BC8006bab2cc5A850a9305, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x9e56625509c2F60aF937F23B7b532600390e8C8B, "zdpuAs4oSTUXz9wJX8mY7LTztmrG6i6p1hjmMELgBV9iS1KdG", "zdpuAxJvihwvFgubQqbuAASTX82LWFdk2j24VdUV3XMYPyep4", 0x1875e398cD7FdcE8fF5C9d4ce1Ec904caE51692c, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, "zdpuB2S5VVRMqJAsHWh419r2UhstvaGd7tMv1QtssScgMp5eD", "zdpuAotHLEtTgT7UqvvxR8DoNFG747wZJmcHZh2A1Cw1jMkuK", 0xeDD17DB41eE47B8794b10802aC05806a66f3ab36, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x258DDD84abf61ba1D1E39f95D8863ee9ca218c06, "zdpuB1jeNEWmR5hHkCBNrKEMdYEGy1Ku4Ywzpd6oDztgNiTQd", "zdpuAyVXvGKfZVDqQhrMkgdiZchoEmFWRb6dN6xECrDnu2yHs", 0x84Aa1925A0AfB812Ec4373E321E0b9B82f64574d, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0xd797D5784f43dE300eC0D6bc34fc86023c5d71Ce, "zdpuAtsiTSMUpR8KmVamXzMor4GZNVWfvwjkbPZ9Lo3Pc1Bim", "zdpuAyPN1FSGcr8Gek1THjVd5fzhE6q55posgYCHMCWjDZMAx", 0x6e4125Dd92515AA29Efd24C8bBf09D17DD92F74b, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, "zdpuB1jeNEWmR5hHkCBNrKEMdYEGy1Ku4Ywzpd6oDztgNiTQd", "zdpuAyVXvGKfZVDqQhrMkgdiZchoEmFWRb6dN6xECrDnu2yHs", 0x84Aa1925A0AfB812Ec4373E321E0b9B82f64574d, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x3ece8d40daC89FfB408f7CB5eaf24Ab6A3135028, "zdpuB3VgCA7YhaZwJ7fFMo6b4XU9SmPtzFjWbiaga3K5f1SAS", "zdpuB2Mhqd5iMUosQCk2Ezfi2kRWifg2wCvWwCJ7RDxEyCDbt", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x2A3F7E5170Ea8Ca967f85f091eF84591f639E031, "zdpuB3VgCA7YhaZwJ7fFMo6b4XU9SmPtzFjWbiaga3K5f1SAS", "zdpuB2Mhqd5iMUosQCk2Ezfi2kRWifg2wCvWwCJ7RDxEyCDbt", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x35A7e40871A621d138e6E7e565Ea23b90e333494, "zdpuAvKcumFCCvzdL5AyGL9aW9MNXTy2s13qhs5KyR9bSPLyA", "zdpuAvGEA8xpBgSzM7Z8pAfehtSmnDU4kqCzjfjwvR4B3gmwV", 0x35A7e40871A621d138e6E7e565Ea23b90e333494, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, "zdpuAm16zRaeKfsEuHxCfprknT7p8cekNg4z54zws8BSbvxTZ", "zdpuAm1CDPSstk1JBQcRZZzEbLwLV8274bdnPNqFBtCRcUDNb", 0xc8F4652CdBE54ee3A048B58fFC59B72E4298Fc84, 5));
        address(this).delegatecall(abi.encodeWithSignature("adminCreateBadge(address,string,string,address,uint256)", 0x374Bd185Ee19fD9f8682Eb875E5D0546A8D58CdD, "zdpuAs4oSTUXz9wJX8mY7LTztmrG6i6p1hjmMELgBV9iS1KdG", "zdpuAxJvihwvFgubQqbuAASTX82LWFdk2j24VdUV3XMYPyep4", 0x1875e398cD7FdcE8fF5C9d4ce1Ec904caE51692c, 5));
    }
}
