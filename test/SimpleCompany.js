var SimpleCompany = artifacts.require("./SimpleCompany.sol");
var Faucet = artifacts.require("./Faucet.sol");

// ... more code
contract('SimpleCompany', function(accounts) {

    let company, faucet;

    beforeEach(async function() {
        faucet = await Faucet.deployed();
        company = await SimpleCompany.new(faucet.address, + new Date() + 300000);
    });

    it("check default unlock period of 5 minutes", async function() {
        //re-deploy to check unlock time
        let deployedUnlockedTime = + new Date() + 300000;
        let company = await SimpleCompany.new(faucet.address, deployedUnlockedTime);
        let unlockTime = await company.unlockTime.call();
        assert(unlockTime.valueOf(), deployedUnlockedTime.valueOf(), "unlock period is not 5 minutes from now");
    });

    it("fund company with 100 ether", async function() {
        await web3.eth.sendTransaction({from: accounts[0], to: SimpleCompany.address, value: 100000000000000000000});
        let companyFunds = await web3.eth.getBalance(company.address);
        assert(companyFunds.valueOf(), 100000000000000000000, "company not funded with 100 ETH");
    });

    it("change unlockTime by owner", async function() {
        let newUnlockTime = + new Date() + 12345678910;
        await company.changeUnlockTime(newUnlockTime, { from: accounts[0] });
        let savedUnlockTime = await company.unlockTime.call();

        assert(newUnlockTime, savedUnlockTime.valueOf(), "failed to change unlockTime");
    });

    it("user 1 unable to change unlockTime", async function() {
        let newUnlockTime = + new Date() + 12345678910;
        try {
            await company.changeUnlockTime(newUnlockTime, { from: accounts[1] });
            let savedUnlockTime = await company.unlockTime.call();

        }
        catch(error) {
            assert("Error: VM Exception while processing transaction: invalid opcode", error.toString(), "user 1 was able to change unlockTime");
        }
    });
});