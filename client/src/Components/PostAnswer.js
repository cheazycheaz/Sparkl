import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContract } from '../contracts';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';
import { ethers } from 'ethers';

const PostAnswer = () => {
  const { questionId } = useParams();
  const [answer, setAnswer] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { user } = usePrivy();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError("Please login to post an answer");
      return;
    }

    try {
      // Store answer content on IPFS
      const ipfsResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: { content: answer }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.REACT_APP_PINATA_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET,
        }
      });

      const ipfsHash = ipfsResponse.data.IpfsHash;

      // Post answer to blockchain
      const contract = await getContract(user.wallet.provider);

      console.log('Estimating gas for postAnswer...');
      let gasLimit;
      try {
        gasLimit = await contract.estimateGas.postAnswer(questionId, ipfsHash);
        console.log('Estimated gas limit:', gasLimit.toString());
      } catch (gasEstimateError) {
        console.error('Gas estimation error:', gasEstimateError);
        throw new Error('Failed to estimate gas. The transaction may fail or the contract function might be reverting.');
      }

      console.log('Sending transaction...');
      const tx = await contract.postAnswer(questionId, ipfsHash, {
        gasLimit: gasLimit.mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10)) // 20% buffer
      });
      console.log('Transaction:', tx);

      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      setSuccess(true);
      setAnswer('');
    } catch (error) {
      console.error('Error posting answer:', error);
      setError(error.message || 'Failed to post answer. Please try again.');
    }
  };

  if (!user) {
    return <p>Please log in to post an answer.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Post an Answer</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your Answer"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Post Answer</button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Answer posted successfully!</p>}
    </div>
  );
};

export default PostAnswer;