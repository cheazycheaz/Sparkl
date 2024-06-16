// sparkl/client/src/components/ClaimBounty.js
import React, { useState } from 'react';
import client from '../privyConfig';

const ClaimBounty = ({ questionId, answerId }) => {
  const [claimer, setClaimer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.claimBounty(questionId, answerId);
      alert('Bounty claimed successfully');
    } catch (error) {
      console.error('Error claiming bounty:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Claim Bounty</button>
    </form>
  );
};

export default ClaimBounty;
