# Sample Ethereum Code

## Spec
Build a dapp that runs on Truffle/TestRPC that allows users to perform the following functions:
 
1. Redeem your own custom ERC-20 Tokens from a faucet.
2. Users should be able to purchase "shares" on a separate contract using the redeemed token. 
3. Shares issued in the contract should be exchangeable for a pre-defined amount of Ether (feel free to set the exchange rate yourself) by the shareholder at the end of a period with the click of a button, which would be manually triggered by the owner of the shares contract.
4. If the owner of the contract is using the dapp, he/she should be able to trigger the next period.
 
Considerations:
- A period's an arbitrary amount of time here, which lasts as long as the owner of the contract would like it to.
- The share contract will need to hold X amount of ether deposited by the owner for users to be able to liquidate their share for ether.
 
Anytime shares are issued by a user, an event should be logged on contract. These events should be watched on a node.js backend using an instance of the contract's object
which'll save the user's data into a MongoDB collection, if it hasn't been logged already. (We know this's redundant, but it's simply to test your skills)
 
Make use of Truffle's React box for front-end and TestRPC for development.

## Dependencies

1) MongoDB - `brew install mongodb`
2) Metamask, Mist, or Parity

## Installation

1. `npm install && npm run ethinstall`

2. Import private keys:
    
    Main account
    
    `0xdccc47a4e0d8ae745ab8309d1021b0a81fff19fda7d073123cf262c010d5d0d0`
    
    User #1
    
    `0x67bd8f7a6a37297a7384f03e675238d09d86cf9730ae157b04fbcb5c71b9d18d`

## Running

Run the following, in order, each as a new process:

    npm run mongo
    
    npm run testrpc
    
    npm run deploy
    
    npm run start

Then switch to the private testRPC network (localhost:8545) on Metamask, Mist, or Parity


## Testing

    npm run testrpc
    npm run test