import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../contracts';
import 'process/browser';
import { Buffer } from 'buffer';

const QuestionFeed = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const contract = getContract();
        const questionCount = await contract.questionCount();
        const questionsArray = [];

        for (let i = 1; i <= questionCount; i++) {
          const question = await contract.questions(i);
          questionsArray.push(question);
        }

        setQuestions(questionsArray);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="question-feed">
      <h2>Questions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {questions.map((question, index) => (
        <div key={index} className="question">
          <h3>{question.heading}</h3>
          <p>{question.subheading}</p>
          <p>Banyan File ID: {question.banyanFileId}</p>
          <p>Views: {question.views}</p>
          <p>Bounty: {ethers.utils.formatEther(question.bountyAmount.toString())} ETH</p>
        </div>
      ))}
    </div>
  );
};

export default QuestionFeed;
