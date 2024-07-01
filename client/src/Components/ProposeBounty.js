import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { getContract } from '../contracts';
import { usePrivy } from '@privy-io/react-auth';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

const ProposeBounty = () => {
  const { questionId } = useParams();
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = usePrivy();

  const handleUsernameChange = async (e) => {
    const inputUsername = e.target.value;
    setUsername(inputUsername);

    if (inputUsername) {
      const userRef = ref(db, 'users');
      const userSnapshot = await get(userRef);
      const users = userSnapshot.val();
      
      const foundUser = Object.values(users).find(user => user.username === inputUsername);
      if (foundUser) {
        setRecipient(foundUser.ethAddress);
      } else {
        setRecipient('');
      }
    } else {
      setRecipient('');
    }
  };

  const handleProposeBounty = async () => {
    setError(null);
    setMessage('');

    try {
      if (!user) {
        throw new Error("Please login to propose a bounty");
      }

      if (!amount || !recipient) {
        throw new Error("Please enter both amount and recipient");
      }

      const contract = await getContract(user.wallet.provider);
      const amountInWei = ethers.utils.parseEther(amount);

      const tx = await contract.proposeBounty(questionId, recipient, {
        value: amountInWei,
      });

      await tx.wait();
      setMessage('Bounty proposed successfully!');
      setAmount('');
      setUsername('');
      setRecipient('');
      setShowModal(false);
    } catch (error) {
      console.error('Error proposing bounty:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Propose Bounty
      </button>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Propose Bounty</h3>
                <input
                  type="text"
                  placeholder="Amount in ETH"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="text"
                  placeholder="Recipient Address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
                <button 
                  onClick={handleProposeBounty} 
                  className="bg-[#6666ff] text-white p-2 rounded hover:bg-purple-600 mr-2"
                >
                  Propose Bounty
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProposeBounty;