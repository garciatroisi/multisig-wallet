require("solidity-coverage");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
const {
  INFURA_LINEA_API_RPC,
  INFURA_MUMBAI_API_RPC,
  DEPLOYER_ADDRESS_PRIVATE_KEY,
  POLYGONSCAN_API_KEY,
  LINEASCAN_API_KEY,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  networks: {
    mumbai: {
      url: INFURA_MUMBAI_API_RPC,
      accounts: [`0x${DEPLOYER_ADDRESS_PRIVATE_KEY}`],
    },
    linea_sepolia: {
      url: INFURA_LINEA_API_RPC,
      accounts: [`0x${DEPLOYER_ADDRESS_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan/Polygonscan
    // Obtain one at https://etherscan.io/ | https://polygonscan.io/
    apiKey: {
      //ethereum
      // mainnet: ETHERSCAN_API_KEY,
      // ropsten: ETHERSCAN_API_KEY,
      // rinkeby: ETHERSCAN_API_KEY,
      // goerli: ETHERSCAN_API_KEY,
      // kovan: ETHERSCAN_API_KEY,
      //polygon
      // polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      linea_sepolia: LINEASCAN_API_KEY,
    },
    customChains: [
      {
        network: "linea_sepolia",
        chainId: 59141,
        urls: {
          apiURL: "https://api-sepolia.lineascan.build/api",
          browserURL: "https://sepolia.lineascan.build/address",
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
};
