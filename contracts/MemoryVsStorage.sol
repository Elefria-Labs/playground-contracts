pragma solidity ^0.8.0;

// Sample contract to showcase memory can be used 
// as caching to save value from storage and save gas
contract MemoryVsStorage {
    
    mapping(address=>uint) scores;
    mapping(address=>uint) rewards;

    function rewardAddress(address _addr) public returns (bool){
        if(scores[_addr] > 0){
            rewards[_addr] = 10;
        }

        if(scores[_addr] > 10){
            rewards[_addr] = 10;
        }
        
        if(scores[_addr] > 20){
            rewards[_addr] = 50;
        }
        return true;
    }
     
    // more cheaper than previous one (just an example)
    function rewardAddressCaching(address _addr) public returns (bool){
        uint score= scores[_addr];

        if(score > 0){
            rewards[_addr] = 10;
        }

        if(score > 10){
            rewards[_addr] = 10;
        }
        
        if(score > 20){
            rewards[_addr] = 50;
        }
        return true;
    }

    function setScore(address _addr,uint _score) public returns (bool){
        scores[_addr] = _score;
        return true;
    }
}