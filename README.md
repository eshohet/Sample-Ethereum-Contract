# Sample Ethereum Code

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