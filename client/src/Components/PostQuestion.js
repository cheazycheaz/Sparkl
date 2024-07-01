import React, { useState, useRef } from 'react';
import axios from 'axios';
import { getContract } from '../contracts';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const PostQuestion = () => {
  const { user, login, authenticated, ready } = usePrivy();
  const [heading, setHeading] = useState('');
  const [details, setDetails] = useState('');
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quillRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!heading || topics.length === 0) {
      setError('Please fill in the question and add at least one topic.');
      setIsSubmitting(false);
      return;
    }

    if (!authenticated) {
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
        setError('Failed to connect wallet. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    const data = {
      pinataOptions: { cidVersion: 1 },
      pinataMetadata: { name: 'question.json' },
      pinataContent: { heading, details, topics, author: user ? user.id : 'anonymous', timestamp: Date.now() }
    };

    try {
      const apiKey = process.env.REACT_APP_PINATA_KEY;
      const secretApiKey = process.env.REACT_APP_PINATA_SECRET;

      if (!apiKey || !secretApiKey) {
        throw new Error('Pinata API keys are not set');
      }

      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretApiKey,
        },
      });

      const ipfsHash = response.data.IpfsHash;
      console.log('IPFS Hash:', ipfsHash);

      const contract = await getContract(user?.wallet?.provider);
      console.log('Contract instance:', contract);
      console.log('User wallet address:', user.wallet.address);

      console.log('Estimating gas for postQuestion...');
      let gasLimit;
      try {
        gasLimit = await contract.estimateGas.postQuestion(ipfsHash);
        console.log('Estimated gas limit:', gasLimit.toString());
      } catch (gasEstimateError) {
        console.error('Gas estimation error:', gasEstimateError);
        throw new Error('Failed to estimate gas. The transaction may fail or the contract function might be reverting.');
      }

      console.log('Sending transaction...');
      const tx = await contract.postQuestion(ipfsHash, {
        gasLimit: gasLimit.mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10)) // 20% buffer
      });
      console.log('Transaction:', tx);
    
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      setHeading('');
      setDetails('');
      setTopics([]);
      setNewTopic('');

      alert('Question posted successfully!');
    } catch (error) {
      console.error('Error posting question:', error);
      setError(error.response ? error.response.data.message : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Post a New Question</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Question</label>
          <input
            type="text"
            id="heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
          <ReactQuill
            theme="snow"
            value={details}
            onChange={setDetails}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Topics</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {topics.map((topic, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                {topic}
                <button type="button" onClick={() => removeTopic(topic)} className="ml-2 text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Add a topic"
            />
            <button type="button" onClick={addTopic} className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default PostQuestion;