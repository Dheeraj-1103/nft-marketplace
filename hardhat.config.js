require("@nomiclabs/hardhat-waffle");

const infuraId = process.env.INFURA_PROJECT_ID || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
    },
    // Uncomment to deploy to Polygon Mumbai testnet:
    // mumbai: {
    //   url: `https://polygon-mumbai.infura.io/v3/${infuraId}`,
    //   accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    // },
    // Uncomment to deploy to Polygon Mainnet:
    // matic: {
    //   url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
    //   accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    // }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

