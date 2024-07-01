const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
    networks: {
        // Other network configurations...
    
        baseSepolia: {
          provider: () => new HDWalletProvider(
            process.env.WALLET_KEY, 
            'https://sepolia.base.org' // URL of the Base Sepolia node
          ),
          network_id: 84532, // Network ID for Base Sepolia
          gas: 4500000,        // Gas limit
          gasPrice: 10000000000, // 10 Gwei
        },
      },
  
    compilers: {
      solc: {
        version: "0.8.3",    // Or any later version, like "0.8.19"
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    },
  
    // ... other configurations ...
  };