pragma solidity^0.4.13;

import "./Faucet.sol";
import "zeppelin/contracts/token/ERC20.sol";
import "zeppelin/contracts/math/SafeMath.sol";

contract SimpleCompany {

    address public owner;
    ERC20 public faucet;
    uint8 public SHARES_PER_TOKEN = 1; //1 BET = 1 share
    uint256 public WEI_PER_SHARE = 1; //1 share = 1 WEI

    mapping(address => uint256) balances;

    function SimpleCompany(address _faucet) {
        owner = msg.sender;
        faucet = ERC20(_faucet);
    }

    /**
     *  Returns balance of who
     */

    function balanceOf(address who) returns (uint256) {
        return balances[who];
    }

    /**
     * Buys shares given the amount passed
     */

    function buyShares(uint shares) returns (uint) {
        uint tokens = SafeMath.div(shares, SHARES_PER_TOKEN);

        //approved amount must equal requested amount
        require(faucet.allowance(msg.sender, this) == tokens);


        //make transfer and issue shares
        faucet.transferFrom(msg.sender, this, tokens);
        balances[msg.sender] = SafeMath.add(balances[msg.sender], shares);

        return balances[msg.sender];

    }

    /**
    *   Allows for anyone to make a contribution to fund the company
    */

    function () payable {

    }

}