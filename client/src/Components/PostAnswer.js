import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { create } from 'ipfs-http-client';
import { getContract } from '../contracts';
import 'process/browser';
import { Buffer } from 'buffer';

const ipfs = create({ url: 'https://ipfs.io:5001/api/v0' });

const PostAnswer = () => {
  const { questionId } = useParams();
  const [answer, setAnswer] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const added = await ipfs.add(answer);
      const ipfsHash = added.path;

      const contract = getContract();
      const tx = await contract.postAnswer(questionId, ipfsHash, false);
      await tx.wait();
      setSuccess(true);
    } catch (error) {
      console.error('Error posting answer:', error);
      setError(error.message);
    }
  };

  return (
    <div className="post-answer">
      <h2>Post an Answer</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your Answer"
          required
        />
        <button type="submit">Post Answer</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Answer posted successfully!</p>}
    </div>
  );
};

export default PostAnswer;
