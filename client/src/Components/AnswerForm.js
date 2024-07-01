import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getContract } from '../contracts';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';

const AnswerForm = ({ questionId, onAnswerSubmitted }) => {
  const { user } = usePrivy();
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: 'answer.json' },
        pinataContent: { 
          content: answerContent, 
          author: user ? user.id : 'anonymous', 
          timestamp: Date.now() 
        }
      };

      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.REACT_APP_PINATA_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET,
        },
      });

      const ipfsHash = response.data.IpfsHash;

      if (user && user.wallet) {
        const contract = await getContract();
        await contract.postAnswer(questionId, ipfsHash);
      }

      // Save answer to Firebase
      const answerRef = ref(db, `answers/${questionId}`);
      const newAnswerRef = push(answerRef);
      await set(newAnswerRef, {
        content: answerContent,
        author: user ? user.id : 'anonymous',
        timestamp: Date.now(),
        ipfsHash: ipfsHash
      });

      onAnswerSubmitted(ipfsHash);
      setAnswerContent('');
    } catch (error) {
      console.error('Error posting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <ReactQuill 
        value={answerContent} 
        onChange={setAnswerContent}
        placeholder="Write your answer here..."
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
          ],
        }}
      />
      <button 
        type="submit" 
        disabled={isSubmitting || !answerContent.trim()} 
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </button>
    </form>
  );
};

export default AnswerForm;