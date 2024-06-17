import React, { useState } from 'react';
import axios from 'axios';
import { getContract } from '../contracts'; 
import 'process/browser';
import { Buffer } from 'buffer';

const PostQuestion = () => {
  const [question, setQuestion] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const postQuestionToBlockchain = async (question, ipfsHash) => {
    try {
      const contract = getContract();
      await contract.postQuestion(question, ipfsHash);
      console.log('Question posted to blockchain');
    } catch (error) {
      console.error('Error posting question to blockchain:', error);
      setError('Error posting question to blockchain');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const data = {
      question,
      details,
    };

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PINATA_JWT}`, // Using JWT is recommended
        },
      });

      const ipfsHash = response.data.IpfsHash;
      console.log('IPFS Hash:', ipfsHash);

      // Now store the IPFS hash on the blockchain
      await postQuestionToBlockchain(question, ipfsHash);
    } catch (error) {
      console.error('Error posting question:', error);
      setError('Error uploading content to Pinata');
    }
  };

  return (
    <div>
      <h1>Post a New Question</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          required
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details"
          required
        />
        <button type="submit">Post Question</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default PostQuestion;
