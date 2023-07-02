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

    function create2WithAssembly(bytes memory bytecode, uint _salt) public payable {
        address addr;

        /*
        NOTE: How to call create2
        
        create2(v, p, n, s)
        create new contract with code at memory p to p + n
        and send v wei
        and return the new address
        where new address = first 20 bytes of keccak256(0xff + address(this) + s + keccak256(mem[p…(p+n)))
              s = big-endian 256-bit value
        reference: soliditybyexample
        */
        
        assembly {
            addr := create2(
                callvalue(), // wei sent with current call
                // Actual code starts after skipping the first 32 bytes
                add(bytecode, 0x20),
                mload(bytecode), // Load the size of code contained in the first 32 bytes
                _salt // Salt from function arguments
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        emit Deployed(addr);
    }
}