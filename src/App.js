import React, {Component} from 'react'
import FaucetContract from '../build/contracts/Faucet.json'
import CompanyContract from '../build/contracts/SimpleCompany.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import swal from 'sweetalert'
import '../node_modules/sweetalert/dist/sweetalert.css'
var moment = require('moment');

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tokens: 0,
            shares: 0,
            web3: null,
            faucetInstance: null,
            companyInstance: null,
            SHARES_PER_TOKEN: null,
            WEI_PER_SHARE: null,
            unlockTime: null,
            eth_deposited: 0
        }

        window.this = this //expose globally for debugging and binding purposes
        this.pullFromContract = this.pullFromContract.bind(this);
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.

        getWeb3
            .then(results => {
                this.setState({
                    web3: results.web3
                })

                // Instantiate contract once web3 provided.
                this.instantiateContract()
            })
            .catch((error) => {
                console.log('Error finding web3.', error)
            })
    }

    instantiateContract() {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

        const contract = require('truffle-contract')
        const faucet = contract(FaucetContract)
        const company = contract(CompanyContract)

        faucet.setProvider(this.state.web3.currentProvider)
        company.setProvider(this.state.web3.currentProvider)

        // Declaring this for later so we can chain functions on SimpleStorage.

        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {

            if(accounts[0] === undefined)
            {
                swal("Metamask/Mist locked", "No accounts detected, please unlock wallet or associate account with Dapp", "error")
                clearInterval(window.interval)
            }

            faucet.deployed().then((instance) => {
                this.setState({faucetInstance: instance})
                this.pullFromContract()
            })
            .catch((error) => {
                console.log(error.toString())
                if(error.toString() === "Error: TypeError: Failed to fetch")
                    swal("TestRPC not running", "Run `npm run testrpc` to continue", "error")
                if(error.toString() === "Error: Faucet has not been deployed to detected network (network/artifact mismatch)")
                    swal("Faucet contract not deployed", "Run `npm run deploy` to deploy contracts to network", "error")
                clearInterval(window.interval)

            })
            company.deployed().then((instance) => {
                this.setState({companyInstance: instance})
                this.pullFromContract()

                instance.SHARES_PER_TOKEN.call({from: accounts[0]})
                    .then((result => {
                        this.setState({SHARES_PER_TOKEN: parseFloat(result)})
                    }))
                instance.WEI_PER_SHARE.call({from: accounts[0]})
                    .then((result => {
                        this.setState({WEI_PER_SHARE: parseFloat(result)})
                    }))

            })
            .catch((error => {
                console.log(error)
                if(error.toString() === "Error: TypeError: Failed to fetch")
                    swal("TestRPC not running", "Run `npm run testrpc` to continue", "error")
                if(error.toString() === "Error: SimpleCompany has not been deployed to detected network (network/artifact mismatch)")
                    swal("SimpleCompany contract not deployed", "Run `npm run deploy` to deploy contracts to network", "error")
                clearInterval(window.interval)

            }))
        })

        //refresh every second to provide like real-time experience
        //shouldn't impact UX much since the blockchain is downloaded completely
        window.interval = setInterval(this.pullFromContract, 1000);
    }

    pullFromContract() {

        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.faucetInstance.balanceOf.call(accounts[0], {from: accounts[0]})
                .then((result => {
                    this.setState({tokens: parseFloat(result)})
                }))
                .catch((error => {
                    console.log(error)
                }))
            this.state.companyInstance.balanceOf.call(accounts[0], {from: accounts[0]})
                .then((result => {
                    this.setState({shares: parseFloat(result)})
                }))
                .catch((error => {
                    console.log(error)
                }))
            this.state.web3.eth.getBalance(this.state.companyInstance.address, function(error, res) {
                if(!error)
                    window.this.setState({ eth_deposited: window.this.state.web3.fromWei(parseFloat(res), 'ether') })
                else
                    console.log(error)
            })
            this.state.companyInstance.unlockTime({from: accounts[0]})
                .then((result => {
                    this.setState({unlockTime: parseFloat(result)})
                }))
                .catch((error => {
                    console.log(error)
                }))

        })
    }

    dispenseTokens() {

        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.faucetInstance.dispense({from: accounts[0]})
                .then((result => {
                    this.pullFromContract()
                }))
        })
    }

    buyShares() {


        swal({
                title: "Buy shares",
                text: "The current exchange rate is 1 BET = " + window.this.state.SHARES_PER_TOKEN + " Share",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Enter number of shares to purchase"
            },
            function (shares) {
                if (shares === false) return false;

                if (shares === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }
                swal({
                        title: "Authorize transfer",
                        text: "I approve company to transfer BET on my behalf",
                        type: "info",
                        showCancelButton: true,
                        confirmButtonText: "Authorize",
                        closeOnConfirm: false
                    },
                    function () {
                        window.this.state.web3.eth.getAccounts((error, accounts) => {
                            window.this.state.faucetInstance.approve(window.this.state.companyInstance.address, shares, {
                                from: accounts[0],
                                gas: 200000
                            })
                                .then((result => {
                                    //transaction approved, proceed to pull funds
                                    swal({
                                            title: "Exchange BET for shares",
                                            text: "Transfer BET in exchange for shares",
                                            type: "info",
                                            showCancelButton: true,
                                            confirmButtonText: "Transfer",
                                            closeOnConfirm: false
                                        },
                                        function () {
                                            window.this.state.companyInstance.buyShares(shares, {
                                                from: accounts[0],
                                                gas: 200000
                                            })
                                                .then((result => {
                                                    window.this.pullFromContract()
                                                    swal("Good job!", "You successfully purchased shares", "success")
                                                }))
                                        }
                                    )
                                }))
                        })
                    }
                )
            }
        )
    }

    exchangeShares() {
        swal({
                title: "Exchange shares",
                text: "The current exchange rate is 1 share = " +
                window.this.state.web3.fromWei(window.this.state.WEI_PER_SHARE, "ether") + " Ξ",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: "Enter number of shares to exchange for Ξ"
            },
            function(shares) {
                if (shares === false) return false;

                if (shares === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }
                window.this.state.web3.eth.getAccounts((error, accounts) => {
                    window.this.state.companyInstance.exchangeShares(shares, {from: accounts[0], gas: 200000})
                        .then((result => {
                            swal("Good job!", "Shares have succesfully been exchanged", "success")
                        }))
                })


            })
    }

    changeUnlockTime() {
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.companyInstance.owner.call({from: accounts[0]})
                .then((owner => {
                    if(owner !== accounts[0]) {
                        swal("Error", "Only the owner can change the unlock time", "error")
                    }
                    else {
                        swal({
                            title: "Change unlock period",
                            text: "Enter the number of seconds until the next period unlocks. Enter 0 to immediately unlock.",
                            type: "input",
                            showCancelButton: true,
                            closeOnConfirm: true,
                            animation: "slide-from-top",
                            inputPlaceholder: "Seconds"
                            },
                            function(seconds) {
                                if(seconds === "" || seconds === false)
                                    return
                                window.this.state.companyInstance.changeUnlockTime(seconds, {from: accounts[0]})
                                    .then((result => {
                                        window.this.pullFromContract()
                                        swal("Good job!", "Unlock time has been changed", "success")

                                    }))
                            }
                        )
                    }
                }))
        })
    }

    render() {
        return (
            <div className="App">
                <nav className="navbar pure-menu pure-menu-horizontal">
                    <a href="#" className="pure-menu-heading pure-menu-link"></a>
                </nav>

                <main className="container">
                    <div className="pure-g">
                        <div className="pure-u-1-1">
                            <h1>Wealth Manager</h1>
                            <p>You currently have {this.state.tokens} BET tokens</p>
                            <p>You currently have {this.state.shares} shares</p>
                            <p>The next exchange date is&nbsp;
                                {
                                moment(this.state.unlockTime).fromNow()
                                }, with an exchange rate of 1 share = {this.state.WEI_PER_SHARE} WEI</p>
                            <p>There is currently {this.state.eth_deposited} ETH deposited in the company</p>
                            <p>
                                <button onClick={() => this.dispenseTokens()}>Collect tokens</button>
                                <button onClick={() => this.buyShares()}>Buy Shares</button>
                                <button onClick={() => this.exchangeShares()}>Exchange</button>
                                <button onClick={() => this.changeUnlockTime()}>Change unlockTime</button>

                            </p>

                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

export default App
