var Faucet = artifacts.require("./Faucet.sol");
// ... more code
contract('Faucet', function(accounts) {

    it("check if faucet symbol is BET", async function() {
        let faucet = await Faucet.deployed();
        let symbol = await faucet.symbol.call();
        assert.equal(symbol, "BET", "Symbol name is not BET");
    });

});