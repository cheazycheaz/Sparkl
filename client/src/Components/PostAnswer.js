import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContract } from '../contracts';
import 'process/browser';
import { usePrivy } from '@privy-io/react-auth';

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

    try {
      if (!user) {
        throw new Error("Please login to post an answer");
      }

      const contract = await getContract();
      const tx = await contract.postAnswer(questionId, answer, false);
      await tx.wait();
      setSuccess(true);
      setAnswer('');
    } catch (error) {
      console.error('Error posting answer:', error);
      setError(error.message);
    }
  };

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