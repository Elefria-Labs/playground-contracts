pragma solidity ^0.8.16;

contract IsContract{
/*
This below will fail in some scenarios,
- In the constructor scope, the isContract() routine returns false
because the code of the contract is still zero during its creation.
- If you provide an address where a new contract will be deployed in the future,
- or an address where a contract previously existed but was deleted
*/

    bytes32 constant  accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    function isContract(address account) internal view returns (bool) {
        bytes32 codeHash;

        assembly {
            codeHash := extcodehash(account)
             }

        return (codeHash != accountHash && codeHash != 0x0);
    }
}