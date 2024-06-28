import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_BASE_SEPOLIA_RPC_URL);

export default provider;
