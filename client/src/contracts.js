import { ethers } from "ethers";
import abi from './QuestionAnswer.json'; 
import 'process/browser';

const contractAddress = "0x116074D3f9a94826300fd3A55A6f49eFcC4eD7a0";

// Function to add or switch to the Base Sepolia network
const switchNetwork = async () => {
  const baseSepoliaChainId = '0x14A34'; // Chain ID for Base Sepolia in hexadecimal (84532 in decimal)
  const networkData = {
    chainId: baseSepoliaChainId,
    chainName: 'Base Sepolia',
    rpcUrls: ['https://sepolia.base.org'], // Replace with actual RPC URL
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.base.org/explorer'] // Replace with actual block explorer URL
  };

  try {
    // Request to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: baseSepoliaChainId }]
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Request to add the network
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkData]
        });
      } catch (addError) {
        throw new Error('Failed to add Base Sepolia network');
      }
    } else {
      throw new Error('Failed to switch to Base Sepolia network');
    }
  }
};

// Function to get the provider
const getProvider = async () => {
  if (typeof window.ethereum !== 'undefined') {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Switch to the Base Sepolia network
    await switchNetwork();

    // Set up the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Ensure the network is Base Sepolia
    const network = await provider.getNetwork();
    if (network.chainId !== 84532) { // Replace with the correct chainId for Base Sepolia
      throw new Error('Failed to switch to Base Sepolia network');
    }

    return provider;
  } else {
    // Fallback to a JsonRpcProvider if MetaMask is not available
    return new ethers.providers.JsonRpcProvider(process.env.REACT_APP_BASE_SEPOLIA_RPC_URL);
  }
};

export const getContract = async () => {
  const provider = await getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, abi.abi, signer); // Use `abi.abi` to reference the ABI
};