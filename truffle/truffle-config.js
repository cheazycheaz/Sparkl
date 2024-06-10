require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = process.env.WALLET_KEY;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(privateKey, "https://sepolia.base.org"),
      network_id: 84532,
      gas: 6000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: '0.8.3',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};