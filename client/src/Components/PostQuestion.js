import React, { useState } from 'react';
import axios from 'axios';
import { getContract } from '../contracts';

const PostQuestion = () => {
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const registerUser = async (contract) => {
    try {
      const signer = contract.signer;
      const address = await signer.getAddress();

      // Assuming there is a function to check if the user exists
      const user = await contract.users(address);
      if (user.userAddress === '0x0000000000000000000000000000000000000000') {
        // Call the registration function with some default values
        await contract.registerUser("Default Name", "Default Bio", "", "", "", "username", "occupation");
        console.log('User registered');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Error registering user');
    }
  };

  const postQuestionToBlockchain = async (heading, subheading, ipfsHash) => {
    try {
      const contract = await getContract(); // Note the change here to await the contract
      await registerUser(contract); // Ensure the user is registered
      await contract.postQuestion(heading, subheading, ipfsHash);
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
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: 'question.json'
      },
      pinataContent: {
        heading,
        subheading,
        details
      }
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

      // Now store the IPFS hash on the blockchain
      await postQuestionToBlockchain(heading, subheading, ipfsHash);
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
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Heading"
          required
        />
        <input
          type="text"
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          placeholder="Subheading"
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
