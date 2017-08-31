pragma solidity^0.4.13;

import "./Faucet.sol";

contract SimpleCompany {

    address public faucet;
    address public owner;

    function SimpleCompany(address _faucet) {
        faucet = _faucet;
        owner = msg.sender;
    }
}