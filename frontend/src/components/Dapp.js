import React, { useEffect, useState } from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { ContractData } from "./ContractData";
import { Loading } from "./Loading";
// import { Transfer } from "./Transfer";
// import { TransactionErrorMessage } from "./TransactionErrorMessage";
// import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
// import { NoTokensMessage } from "./NoTokensMessage";

// This is the default id used by the Mumbai Network
const MUMBAI_NETWORK_ID = "80001";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Multisig contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync, and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the Multisig (i.e. transfers available)
      nultisigData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };
    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }
    // If the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.balance) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>MultisigWallet Dash</h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>{this.state.balance.toString()} MATIC</b>.
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            <ContractData provider={this._provider} />
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {/*
              If the user has no tokens, we don't show the Transfer form
            */}
            {/* {this.state.balance.eq(0) && (
              <NoTokensMessage selectedAddress={this.state.selectedAddress} />
            )} */}

            {/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
            {/* {this.state.balance.gt(0) && (
              <Transfer
                transferTokens={(to, amount) =>
                  this._transferTokens(to, amount)
                }
                tokenSymbol={this.state.tokenData.symbol}
              />
            )} */}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask is not installed!");
      return;
    }

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();

    this._initialize(selectedAddress);

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    window.ethereum.on("accountsChanged", this._handleAccountsChanged);
  }

  async _handleAccountsChanged(accounts) {
    alert("handleAccountsChanged");
    this._stopPollingData();
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts.
      console.log("Please connect to MetaMask.");
      return this._resetState();
    } else if (accounts[0] !== this.state.selectedAddress) {
      // Reload your interface with accounts[0].
      this._initialize(accounts[0]);
    }
  }

  async _initialize(userAddress) {
    // This method initializes the dapp
    // We first store the user's address in the component's state
    // await this.setState({
    //   selectedAddress: userAddress,
    // });
    this.setState({ selectedAddress: userAddress });

    // Then, we initialize ethers, fetch data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    this._startPollingData();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateBalance() {
    if (this.state.selectedAddress) {
      const balance = await this._provider.getBalance(
        this.state.selectedAddress
      );
      this.setState({ balance });
    }
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    // You can get network info form https://chainid.network/chains.json
    const decimalNumber = parseInt(MUMBAI_NETWORK_ID, 10);
    const chainIdHex = ethers.utils.hexValue(decimalNumber).toString();
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: "Mumbai",
          rpcUrls: ["https://rpc.ankr.com/polygon_mumbai/"],
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          blockExplorerUrls: ["https:/mumbai.polygonscan.com/"],
        },
      ],
    });
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion !== MUMBAI_NETWORK_ID) {
      this._switchChain();
    }
  }
}
