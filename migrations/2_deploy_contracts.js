var Faucet = artifacts.require("./Faucet.sol");
var SimpleCompany = artifacts.require("./SimpleCompany.sol");

module.exports = function(deployer) {
  deployer.deploy(Faucet).then(function() {
      deployer.deploy(SimpleCompany, Faucet.address);

  });
};
