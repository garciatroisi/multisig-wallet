# Multisig Wallet

## Description

This smart contract implements a Multisig wallet. It allows a group of addresses to approve and execute fund transfers from the wallet.

## Features

- **Multisignature**: Requires approval from multiple addresses before executing a transfer.
- **Configurable Quorum**: The minimum number of approvals required to execute a transfer is configurable.
- **Secure**: Transfers cannot be executed until the required quorum is reached.

## Usage

1. **Initial setup**: Specify the list of addresses that can approve transfers and the required quorum into ignition/modules.Wallets.

2. **Deploy the contract**: Deploy the contract on the network of your choice using the provided script:

```bash
npx hardhat ignition deploy ignition/modules/Wallets.js --network <your-network>
```

3. **Deposit funds**: Funds can be deposited into the Multisig wallet by sending directly to the contract address.

4. **Create transfers**: Wallet owners can create transfers by specifying the recipient, amount, and a description.

5. **Approve transfers**: Owners can approve transfers created by other owners.

6. **Execute transfers**: Once a transfer has been approved by the required number of owners, it can be executed to send the funds to the specified recipient.

## Deploy using script

```bash
npx hardhat run --network <your-network> scripts/deploy.js
```

## Ignition

```bash
npx hardhat ignition deploy ignition/modules/Wallets.js --network <your-network>
```

## Verify

```bash
npx hardhat verify --network mumbai --constructor-args arguments.js <address>
```


## Testing

This project includes automated tests using Hardhat and coverage to ensure the integrity of the smart contract.

To run the tests, make sure you have Hardhat installed and run the following command:

```bash
npx hardhat test
```

# Coverage
```bash
npx hardhat coverage
```

## License

This project is licensed under the [MIT License](LICENSE).
