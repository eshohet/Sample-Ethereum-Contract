var Faucet = artifacts.require("./Faucet.sol");
// ... more code
contract('Faucet', function(accounts) {

    it("faucet deployed with BET symbol", async function() {
        let faucet = await Faucet.deployed();
        let symbol = await faucet.symbol.call();
        assert.equal(symbol, "BET", "Symbol name is not BET");
    });

    it("dispense tokens", async function() {
        let faucet = await Faucet.deployed();
        let FAUCET_AMOUNT = await faucet.FAUCET_AMOUNT.call();
        await faucet.dispense({from: accounts[0]});
        let accountBalance = await faucet.balanceOf.call(accounts[0]);
        assert.equal(FAUCET_AMOUNT.valueOf(), accountBalance.valueOf(), "account balance not equal to dispensed amount");
    });


});