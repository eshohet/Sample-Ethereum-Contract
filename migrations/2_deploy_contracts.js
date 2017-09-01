var Faucet = artifacts.require("./Faucet.sol");
var SimpleCompany = artifacts.require("./SimpleCompany.sol");

module.exports = function(deployer, network, accounts) {

    deployer.deploy(Faucet).then(function() {
        return deployer.deploy(SimpleCompany, Faucet.address, + new Date() + 300000).then(function() {
            return web3.eth.sendTransaction({from: accounts[0], to: SimpleCompany.address, value: 100000000000000000000});
        });
    });
};
