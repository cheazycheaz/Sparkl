import React, { useState, useEffect } from 'react';
import SparkleSpinner from './SparkleSpinner';
import { getContract } from '../contracts';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

const UserBounties = ({ userAddress }) => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const contract = await getContract();
        const questionCount = await contract.questionCount();
        
        let userBounties = [];
        for (let i = 1; i <= questionCount; i++) {
          const bounty = await contract.questionBounties(i, userAddress);
          if (bounty.amount.gt(0)) {
            const question = await contract.questions(i);
            userBounties.push({
              questionId: i,
              amount: ethers.utils.formatEther(bounty.amount),
              proposedAt: new Date(bounty.proposedAt.toNumber() * 1000).toLocaleString(),
              ipfsHash: question.ipfsHash
            });
          }
        }
        
        setBounties(userBounties);
      } catch (error) {
        console.error("Error fetching bounties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, [userAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SparkleSpinner />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Bounties</h2>
      {bounties.length === 0 ? (
        <p className="text-gray-600">No open bounties available.</p>
      ) : (
        <ul>
          {bounties.map((bounty) => (
            <li key={bounty.questionId} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <Link to={`/question/${bounty.questionId}`} className="text-blue-600 hover:underline">
                Question #{bounty.questionId}
              </Link>
              <p>Amount: {bounty.amount} ETH</p>
              <p>Proposed at: {bounty.proposedAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserBounties;