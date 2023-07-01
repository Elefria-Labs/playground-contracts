// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract D {
    uint public x;
    constructor(uint a) {
        x = a;
    }
}

contract Create2 {
    event Deployed(address d);
    function createD(uint arg) public {
        address d = address(new D(arg));
        emit Deployed(d);
    }
    function createDSalted(bytes32 salt, uint arg) public view returns (address){
        // This complicated expression just tells you how the address
        // can be pre-computed. It is just there for illustration.
        // You actually only need ``new D{salt: salt}(arg)``.
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked(type(D).creationCode,abi.encode(arg)))
        )))));
        
        return predictedAddress;
        // Also we can do this 
        // D d = new D{salt: salt}(arg);
        // require(address(d) == predictedAddress);
    }
}