pragma solidity^0.4.13;

import "./Faucet.sol";
import "zeppelin/contracts/token/ERC20.sol";
import "zeppelin/contracts/math/SafeMath.sol";

contract SimpleCompany {

    address public owner;
    ERC20 public faucet;
    uint8 public SHARES_PER_TOKEN = 1; //1 BET = 1 share
    uint256 public WEI_PER_SHARE = 1500000000000000000; //1 share = 1.5 ETH
    uint256 public totalSupply = 0;
    mapping(address => uint256) balances;
    uint256 public unlockTime;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    event SharesBought(uint shares, address buyer);

    /**
     *  Setups contract
     *  $_faucet Faucet address
     *  $_unlockTime Time the period ends, unix timestamp (ms)
     */

    function SimpleCompany(address _faucet, uint _unlockTime) {
        owner = msg.sender;
        faucet = ERC20(_faucet);
        unlockTime = _unlockTime;
    }

    /**
     *  Returns balance of who
     *  $who Address whose balance is being looked up
     */

    function balanceOf(address who) returns (uint256) {
        return balances[who];
    }

    /**
     *  Buys shares given the amount passed
     *  $shares Number of shares purchasing
     */

    function buyShares(uint shares) returns (uint) {
        uint tokens = SafeMath.div(shares, SHARES_PER_TOKEN);

        //approved amount must equal requested amount
        require(faucet.allowance(msg.sender, this) == tokens);


        //make transfer and issue shares
        faucet.transferFrom(msg.sender, this, tokens);
        balances[msg.sender] = SafeMath.add(balances[msg.sender], shares);

        totalSupply = SafeMath.add(shares, totalSupply);

        SharesBought(shares, msg.sender);

        return balances[msg.sender];

    }

    /**
     *  Allows any user to exchange their shares for ethereum
     *  after period ends
     *  $shares Number of shares to exchange for ethereum
     */

    function exchangeShares(uint shares) {
        require(SafeMath.mul(now, 1000) >= unlockTime); //convert seconds to ms
        require(balances[msg.sender] >= shares);

        uint wei_sending = SafeMath.mul(WEI_PER_SHARE, shares);
        require(this.balance >= wei_sending);

        balances[msg.sender] = SafeMath.sub(balances[msg.sender], shares);

        //automatically revert state in the case of failure
        msg.sender.transfer(wei_sending);

    }


    /**
     *   Allows for anyone to make a contribution to fund the company
     */

    function () payable {

    }

    /**
     *   Allows for the owner to unlock
     */

    function unlock() onlyOwner {
        unlockTime = now;
    }

    /**
     *   Allows for the owner change the unlock time
     *   $seconds Number of seconds to add to the current time
     */

    function changeUnlockTime(uint _seconds) onlyOwner {
        unlockTime = SafeMath.add(SafeMath.mul(now, 1000), SafeMath.mul(_seconds, 1000));
    }

}