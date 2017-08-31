pragma solidity^0.4.13;

import "./Faucet.sol";
import "zeppelin/contracts/token/ERC20.sol";

contract SimpleCompany {

    address public owner;
    ERC20 public faucet;

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

}