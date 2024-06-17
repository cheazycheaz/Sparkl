import { ethers } from "ethers";
import abi from './QuestionAnswer.json'; 
import 'process/browser';
import { Buffer } from 'buffer';

// Your smart contract address
const contractAddress = "0x116074D3f9a94826300fd3A55A6f49eFcC4eD7a0";

export const getContract = () => {
    // Set up the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Set up the signer
    const signer = provider.getSigner();
    

    // Create and return the contract instance
    return new ethers.Contract(contractAddress, abi.abi, signer); // Use `abi.abi` to reference the ABI
};
