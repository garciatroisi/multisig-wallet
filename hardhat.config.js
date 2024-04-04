require("solidity-coverage");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
const { INFURA_API_RPC, DEPLOYER_ADDRESS_PRIVATE_KEY, POLYGONSCAN_API_KEY } =
  process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  networks: {
    mumbai: {
      url: INFURA_API_RPC,
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
    },
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
};
