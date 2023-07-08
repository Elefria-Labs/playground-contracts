
pragma solidity ^0.8.0;

contract GasSaving {
    //unoptimized 1218
    function solidityHashUo(uint256 a, uint256 b) public pure returns (bytes32){
    return keccak256(abi.encodePacked(a, b));
    }

    function solidityHash(uint256 a, uint256 b) public pure returns (bytes32){
        bytes32 hashedVal;
    //optimized 816
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            hashedVal := keccak256(0x00, 0x40)
        }
        return hashedVal;
    }    

    //addition in Solidity 940
    function addUo(uint256 a, uint256 b) public pure returns (uint256){
        uint256 c = a + b;
        return c;
    }
    
    // 809
    function add(uint256 a, uint256 b) public pure returns (uint256){
        uint256 c;
        assembly {
            c := add(a, b)
            if lt(c, a) {
                mstore(0x00, "overflow")
                revert(0x00, 0x20)
            }
        }
        return c;
    }

    //subtraction 1028
    function subUo(uint256 a, uint256 b) public pure returns (uint256){
        uint256 c = a - b;
        return c;
    }

    // 831
    function sub(uint256 a, uint256 b) public pure returns (uint256){
        uint256 c;
        assembly{
            c:=sub(a,b)
            if gt(c, a) {
                mstore(0x00, "underflow")
                revert(0x00, 0x20)
            }
        }
        return c;
    }
    
    // 1026
    function mulUo(uint256 a, uint256 b) public pure returns(uint) {
        uint256 c = a * b;
        return c;
    }

    // 855
    function mul(uint256 a, uint256 b) public pure returns (uint){
        uint c;
        assembly{
            c:=mul(a,b)
            if lt(c,a){
                mstore(0x00,"overflow")
                revert(0x00,0x20)
            }
        }
        return c;
    }
    
    // 1044
    function divUo(uint256 a, uint256 b) public pure returns (uint){
        uint c= a/b;
        return c;
    }

    // 878
    function div(uint256 a, uint256 b) public pure returns (uint){
        uint c;
        assembly{
            c:=div(a,b)
            if gt(c,a){
                mstore(0x00,"underflow")
                revert(0x00,0x20)
            }
        }
        return c;
    }

    address setMeUp = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;

    function updateValueUo(address setMeUp_) public {
        setMeUp = setMeUp_;
    }

    function updateValue(address setMeUp_) public {
        assembly{
            sstore(setMeUp.slot,setMeUp_)
        }
    }

    function ownerNotZero(address _addr) public pure {
        require(_addr != address(0), "zero address)");
    }

    function assemblyOwnerNotZero(address _addr) public pure {
        assembly {
            if iszero(_addr) {
                mstore(0x00, "zero address")
                revert(0x00, 0x20)
            }
        }
    }

}