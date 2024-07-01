import { ethers } from "ethers";
import abi from './QuestionAnswer.json';

const contractAddress = "0x14D0AE3f6C7e9469450d77719EF8ba0cf8eA4F70";
const baseSepoliaChainId = '0x14a34';

const switchNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork();
    if (network.chainId === parseInt(baseSepoliaChainId, 16)) {
      console.log('Already on Base Sepolia network');
      return;
    }

    await provider.send('wallet_switchEthereumChain', [{ chainId: baseSepoliaChainId }]);
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await provider.send('wallet_addEthereumChain', [{
          chainId: baseSepoliaChainId,
          chainName: 'Base Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org']
        }]);
      } catch (addError) {
        console.error('Failed to add Base Sepolia network', addError);
      }
    } else {
      console.error('Failed to switch to Base Sepolia network', switchError);
    }
  }
};

export const getContract = async (privyProvider) => {
  let provider;
  if (privyProvider) {
    provider = new ethers.providers.Web3Provider(privyProvider, "any");
  } else if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  } else {
    console.warn('No wallet detected. Falling back to JSON-RPC provider.');
    provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_BASE_SEPOLIA_RPC_URL);
  }

  await switchNetwork(provider);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, abi.abi, signer);
};
