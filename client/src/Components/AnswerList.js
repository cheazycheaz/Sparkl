import React, { useState, useEffect } from 'react';
import { getContract } from '../contracts';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

const AnswerList = () => {
  const { questionId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const contract = await getContract();
        const answerIds = await contract.getQuestionAnswers(questionId);
        
        const fetchedAnswers = await Promise.all(answerIds.map(async (id) => {
          const answer = await contract.answers(id);
          const ipfsResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${answer.ipfsHash}`);
          const userRef = ref(db, `users/${answer.author}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val() || {};
          
          return {
            id: id.toString(),
            content: ipfsResponse.data.content,
            author: answer.author,
            authorName: userData.name || 'Anonymous',
            authorUsername: userData.username || '',
            authorProfilePic: userData.profilePicture || '/default-avatar.png',
            timestamp: new Date(answer.timestamp.toNumber() * 1000).toLocaleString(),
            upvotes: answer.upvoteCount.toNumber(),
          };
        }));

        setAnswers(fetchedAnswers);
      } catch (error) {
        console.error('Error fetching answers:', error);
        setError(error.message);
      }
    };

    fetchAnswers();
  }, [questionId]);

  const handleLike = async (answerId) => {
    try {
      const contract = await getContract();
      const tx = await contract.upvoteAnswer(answerId);
      await tx.wait();
      // Update the local state to reflect the new upvote count
      setAnswers(answers.map(answer => 
        answer.id === answerId ? { ...answer, upvotes: answer.upvotes + 1 } : answer
      ));
    } catch (error) {
      console.error('Error liking answer:', error);
      setError(error.message);
    }
  };

  return (
    <div className="answer-list">
      <h2 className="text-2xl font-bold mb-4">Answers</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {answers.map((answer) => (
        <div key={answer.id} className="mb-6 p-4 bg-white rounded-lg shadow relative">
          <div className="flex items-center mb-2">
            <img src={answer.authorProfilePic} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
            <div>
              <span className="font-bold">{answer.authorName}</span>
              {answer.authorUsername && <span className="text-gray-500 ml-1">@{answer.authorUsername}</span>}
            </div>
          </div>
          <p className="text-gray-700 mb-2">{answer.content}</p>
          <p className="text-sm text-gray-500">{answer.timestamp}</p>
          <button
            onClick={() => handleLike(answer.id)}
            className="absolute bottom-2 right-2 flex items-center text-gray-500 hover:text-red-500"
          >
            <svg className="w-5 h-5 stroke-current" viewBox="0 0 20 20" fill="none" strokeWidth="2">
              <path d="M10 18l-1.45-1.32C3.53 12.24 0 9.24 0 5.5 0 2.42 2.42 0 5.5 0 7.24 0 8.91.81 10 2.09 11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.74-3.53 6.74-8.55 11.18L10 18z"/>
            </svg>
            <span className="ml-1">{answer.upvotes}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnswerList;