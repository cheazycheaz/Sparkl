import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { getContract } from '../contracts';
import 'process/browser';
import { usePrivy } from '@privy-io/react-auth';

const ProposeBounty = () => {
  const { questionId } = useParams();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const { user } = usePrivy();

  const handleProposeBounty = async () => {
    setError(null);
    setMessage('');

    try {
      if (!user) {
        throw new Error("Please login to propose a bounty");
      }

      const contract = await getContract();
      const amountInWei = ethers.utils.parseEther(amount);

      const tx = await contract.proposeBounty(questionId, amountInWei, {
        value: amountInWei,
      });

      await tx.wait();
      setMessage('Bounty proposed successfully!');
      setAmount('');
    } catch (error) {
      console.error('Error proposing bounty:', error);
      setError(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Propose Bounty for Question {questionId}</h2>
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <button onClick={handleProposeBounty} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Propose Bounty</button>
      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProposeBounty;