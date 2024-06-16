import React, { useState, useEffect } from 'react';
import { getContract } from '../contracts';
import { useParams } from 'react-router-dom';

const AnswerList = () => {
  const { questionId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const contract = getContract();
        const answerIds = await contract.questionAnswers(questionId);
        const answersArray = [];

        for (let i = 0; i < answerIds.length; i++) {
          const answer = await contract.answers(answerIds[i]);
          answersArray.push(answer);
        }

        setAnswers(answersArray);
      } catch (error) {
        console.error('Error fetching answers:', error);
        setError(error.message);
      }
    };

    fetchAnswers();
  }, [questionId]);

  const handleLike = async (answerId) => {
    try {
      const contract = getContract();
      const tx = await contract.likeAnswer(answerId);
      await tx.wait();
      alert('Answer liked!');
    } catch (error) {
      console.error('Error liking answer:', error);
      setError(error.message);
    }
  };

  return (
    <div className="answer-list">
      <h2>Answers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {answers.map((answer, index) => (
        <div key={index} className="answer">
          <p>Author: {answer.author}</p>
          <p>Banyan File ID: {answer.banyanFileId}</p>
          <p>Likes: {answer.likes}</p>
          <button onClick={() => handleLike(answer.id)}>Like</button>
        </div>
      ))}
    </div>
  );
};

export default AnswerList;
