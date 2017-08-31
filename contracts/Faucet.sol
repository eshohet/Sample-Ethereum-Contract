pragma solidity^0.4.13;

import "zeppelin/contracts/token/MintableToken.sol";

contract Faucet is MintableToken {

    string public name = "BET Token";
    string public symbol = "BET";
    uint256 public decimals = 18;
    uint256 public INITIAL_SUPPLY = 0;
    uint8 public FAUCET_AMOUNT = 10; //number of tokens to dispense

    /**
     * @dev Contructor that gives msg.sender all of existing tokens.
     */
    function Faucet() {
    }

    /**
     *  Dispenses tokens
     */

    function dispense() canMint returns (bool) {
        totalSupply = totalSupply.add(FAUCET_AMOUNT);
        balances[msg.sender] = balances[msg.sender].add(FAUCET_AMOUNT);
        Mint(msg.sender, FAUCET_AMOUNT);
        return true;
    }

}