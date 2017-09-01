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
            faucet.deployed().then((instance) => {
                this.setState({faucetInstance: instance})
                this.pullFromContract()
            })
            company.deployed().then((instance) => {
                this.setState({companyInstance: instance})
                this.pullFromContract()

                instance.SHARES_PER_TOKEN.call({from: accounts[0]})
                    .then((result => {
                        this.setState({SHARES_PER_TOKEN: result.c[0]})
                    }))
                instance.WEI_PER_SHARE.call({from: accounts[0]})
                    .then((result => {
                        this.setState({WEI_PER_SHARE: result.c[0]})
                    }))

            })
        })
    }

    pullFromContract() {
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.faucetInstance.balanceOf.call(accounts[0], {from: accounts[0]})
                .then((result => {
                    this.setState({tokens: result.c[0]})
                }))
                .catch((error => {
                    console.log(error)
                }))
            this.state.companyInstance.balanceOf.call(accounts[0], {from: accounts[0]})
                .then((result => {
                    this.setState({shares: result.c[0]})
                }))
                .catch((error => {
                    console.log(error)
                }))
            this.state.web3.eth.getBalance(this.state.companyInstance.address, function(err, res) {
                if(!err)
                    window.this.setState({ eth_deposited: window.this.state.web3.fromWei(parseFloat(res), 'ether') })
                else
                    console.log(err)
            })
            this.state.companyInstance.unlockTime({from: accounts[0]})
                .then((result => {
                    this.setState({unlockTime: result.c[0]})
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
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: "Enter number of shares to purchase"
            },
            function(shares) {
                if (shares === false) return false;

                if (shares === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }

                window.this.state.web3.eth.getAccounts((error, accounts) => {
                    window.this.state.faucetInstance.approve(window.this.state.companyInstance.address, shares, {from: accounts[0], gas: 200000})
                        .then((result => {
                            //transaction approved, proceed to pull funds
                            window.this.state.companyInstance.buyShares(shares, {from: accounts[0], gas: 200000})
                                .then((result => {
                                    window.this.pullFromContract()
                                }))
                        }))
                })


            });
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
                                }, with an exchange rate of 1 WEI = {this.state.WEI_PER_SHARE} share</p>
                            <p>There is currently {this.state.eth_deposited} ETH deposited in the company</p>
                            <p>
                                <button onClick={() => this.dispenseTokens()}>Collect tokens</button>
                                <button onClick={() => this.buyShares()}>Buy Shares</button>
                                <button onClick={() => this.buyShares()}>Exchange</button>

                            </p>

                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

export default App
