
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract SendAll {
    
    mapping(address => mapping(address => uint)) tokenAllowances;
    address public owner;
    constructor(){
        owner = msg.sender;
    }

    function transferTokens(address[] memory tokens, uint[] memory amounts, address to) external payable {
        require(tokens.length == amounts.length,"Invalid params");
        // commented to save gas
        // require(msg.sender != to,"Invalid params");
        
        uint len = tokens.length;
        for(uint i; i<len; ++i){
            IERC20 token = IERC20(tokens[i]);
            token.transferFrom(msg.sender, to, amounts[i]);
        }
    }

}
