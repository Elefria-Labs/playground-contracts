// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SendAll {
    
    function transferTokens(address[] memory tokens, uint[] memory amounts, address to) external payable {
        require(to != address(0),"E:address");
        require(tokens.length == amounts.length,"E:params");
        // commented to save gas
        // require(msg.sender != to,"Invalid params");
        
        uint len = tokens.length;
        for(uint i; i<len; ++i){
            IERC20 token = IERC20(tokens[i]);
            token.transferFrom(msg.sender, to, amounts[i]);
        }
    }
}
