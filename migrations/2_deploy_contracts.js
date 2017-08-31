var Faucet = artifacts.require("./Faucet.sol");
var SimpleCompany = artifacts.require("./SimpleCompany.sol");

module.exports = function(deployer, network, accounts) {

    deployer.deploy(Faucet);

    deployer.deploy(SimpleCompany, Faucet.address).then(function() {
        web3.eth.sendTransaction({from: accounts[0], to: SimpleCompany.address, value: 100000000000000000000}, function(err, res) {
            if(!err) {
                console.log(res);
                return;
            }
            else
                console.log(err);
        });
    });



  // deployer.deploy(Faucet).then(function() {
  //     deployer.deploy(SimpleCompany, Faucet.address).then(function() {
  //         //automatically fund with 100 Ether
  //
  //     });
  // });
};
