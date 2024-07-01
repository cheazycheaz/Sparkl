import React, { useState } from 'react';
import { getContract } from '../contracts';
import { usePrivy } from '@privy-io/react-auth';

const ClaimBounty = ({ questionId, answerId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = usePrivy();

  const handleClaimBounty = async () => {
    if (!user) {
      setError("Please login to claim the bounty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const contract = await getContract();
      const tx = await contract.claimBounty(questionId, answerId);
      await tx.wait();
      setSuccess(true);
    } catch (error) {
      console.error('Error claiming bounty:', error);
      setError(error.message || 'Failed to claim bounty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleClaimBounty}
        disabled={loading}
        className={`text-sm ${loading ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white px-2 py-1 rounded`}
      >
        {loading ? 'Claiming...' : 'Claim Bounty'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-1">Bounty claimed successfully!</p>}
    </div>
  );
};

export default ClaimBounty;