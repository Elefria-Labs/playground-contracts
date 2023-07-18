pragma solidity ^0.8.0;

// costs in the comments are from remix 8.20 (includes PUSH0)
contract StorageRead {
    uint256 x = 1;  // storage variable
    uint256 y = 2;  // storage variable

    // 2454 gas
    function coldRead() external view returns (uint256 a) {
        a = x;      // cold read
        // a = a + x;  // warm read
    }

    // 2539 gas
    function coldWarmRead() external view returns (uint256 a) {
        a = x;   // cold read
        a = x;  // warm read
    }

     // 2687 gas
    function coldWarmRead2() external view returns (uint256 a,uint256 b) {
        a = x;   // cold read
        b = x;  // warm read
    }

    // 2454 gas
    function coldRead2() external view returns (uint256 a) {
        a = y;      // cold read
    }

    // 4622 gas
    function coldColdRead() external view returns (uint256 a, uint256 b) {
        a = x;      // cold read
        b = y;  // cold read
    }


    // 4950 gas
    function coldWithoutMemory() external view returns (uint256 a, uint256 b) {
        b = y - x;  // cold storage reads
        a = x;  // warm storage read
    }

    // 4908 gas
    function coldWithMemory() external view returns (uint256 a, uint256 b) {
        uint256 copy = x;
        b = y - copy;  // cold read
        a = copy;  // memory read
    }
    // 2993 gas
    function coldWithoutMemory2() external view returns (uint256 a) {
         if(x < 2){
             a = x;  // warm storage read
         } 

         if(x==1){ // warm storage read
             a = x+1; // warm storage read
         }
    }
    // 2785 gas 
     function coldWithMemory2() external view returns (uint256 a) {
         uint256 copy = x; // copy to memory
         if(copy < 2){
             a = copy; 
         } 

         if(x==1){ 
             a = copy+1; 
         }
    }
}