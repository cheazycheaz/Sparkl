import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../contracts';
import 'process/browser';
import { Buffer } from 'buffer';

const ProposeBounty = ({ questionId }) => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleProposeBounty = async () => {
        try {
            const contract = getContract();

            // Propose a bounty
            const tx = await contract.proposeBounty(questionId, ethers.utils.parseEther(amount), {
                value: ethers.utils.parseEther(amount),
            });

            // Wait for the transaction to be mined
            await tx.wait();

            setMessage('Bounty proposed successfully!');
        } catch (error) {
            console.error('Error proposing bounty:', error);
            setMessage('Failed to propose bounty.');
        }
    };

    return (
        <div>
            <h2>Propose Bounty for Question {questionId}</h2>
            <input
                type="text"
                placeholder="Amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleProposeBounty}>Propose Bounty</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ProposeBounty;
