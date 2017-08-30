pragma solidity^0.4.13;

import "zeppelin/contracts/token/MintableToken.sol";

contract Faucet is MintableToken {

    string public name = "BET Token";
    string public symbol = "BET";
    uint256 public decimals = 18;
    uint256 public INITIAL_SUPPLY = 10000;

    /**
     * @dev Contructor that gives msg.sender all of existing tokens.
     */
    function Faucet() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}