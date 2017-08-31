import React, { Component } from 'react'
import FaucetContract from '../build/contracts/Faucet.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import swal from 'sweetalert'
import '../node_modules/sweetalert/dist/sweetalert.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tokens: 0,
      web3: null,
      faucetInstance: null
    }
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
    faucet.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var faucetInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      faucet.deployed().then((instance) => {
          faucetInstance = instance
          this.setState({faucetInstance: faucetInstance})
          this.updateBalance()
        })
    })
  }

  updateBalance() {
      this.state.web3.eth.getAccounts((error, accounts) => {
          this.state.faucetInstance.balanceOf.call(accounts[0], {from: accounts[0]})
              .then((result => {
                  this.setState({ tokens: result.c[0] })
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
                  this.updateBalance()
              }))
      })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">BET Faucet</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>BET tokens</h1>
              <p>You currently have {this.state.tokens} BET tokens</p>
              <p><button onClick={() => this.dispenseTokens()}>Collect tokens</button></p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
