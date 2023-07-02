pragma solidity ^0.8.16;

contract IsContract{

    bytes32 constant  accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    function isContract(address account) internal view returns (bool) {
        bytes32 codeHash;

        assembly {
            codeHash := extcodehash(account)
             }

        return (codeHash != accountHash && codeHash != 0x0);
    }
}