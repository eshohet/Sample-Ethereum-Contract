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
            savedUnlockTime = await company.unlockTime.call();

        }
        catch(error) {
            assert("Error: VM Exception while processing transaction: invalid opcode", error.toString(), "user 1 was able to change unlockTime");
        }
    });

    it("buy shares", async function() {

        //collect tokens from faucet
        await faucet.dispense({from: accounts[0]});
        let tokens = await faucet.balanceOf.call(accounts[0]).valueOf();
        let SHARES_PER_TOKEN = await company.SHARES_PER_TOKEN.call().valueOf();

        assert(tokens > 0, "balance should not be zero or negative");
        assert(SHARES_PER_TOKEN > 0, "SHARES_PER_TOKEN should not be zero or negative");

        //approve transfer of tokens to company (step 1 of purchasing shares)
        let shares = tokens * SHARES_PER_TOKEN;
        await faucet.approve(company.address, tokens, {from: accounts[0]});
        let approvedAmount = await faucet.allowance(accounts[0], company.address).valueOf();

        assert(approvedAmount, tokens, "requested approved amount is not equal to approved amount");

        //transfer tokens to company and receive shares in exchange
        const purchaseTxn = await company.buyShares(shares);
        assert(purchaseTxn.logs[0].args.shares.valueOf(), shares, "shares purchased do not appear in logs");

        //check balance of shares in company
        const sharesBalance = await company.balanceOf(accounts[0]).valueOf();
        assert(sharesBalance, shares, "shares bought does not equal balance of user");






    });
});