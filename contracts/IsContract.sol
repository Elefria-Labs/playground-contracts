pragma solidity ^0.8.0;

contract IsContract{

/*
This below will fail in some scenarios,
- In the constructor scope, the isContract() routine returns false
because the code of the contract is still zero during its creation.
- If you provide an address where a new contract will be deployed in the future,
- or an address where a contract previously existed but was deleted

But if the below code returns true, then you can be 100% sure that it's a contract.
*/

    bytes32 constant  ACCOUNT_HASH = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    function isThisAContract(address addr_) external view returns (bool) {
        bytes32 extCodeHash;
        
        assembly {
            extCodeHash := extcodehash(addr_)
        }

        return (extCodeHash != ACCOUNT_HASH && extCodeHash != 0x0);
    }
}