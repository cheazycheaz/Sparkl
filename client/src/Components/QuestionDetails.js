import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../privyConfig';
import 'process/browser';
import { Buffer } from 'buffer';

const QuestionDetails = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const question = await client.getQuestionDetails(questionId);
        const answers = await client.getQuestionAnswers(questionId);
        setQuestion(question);
        setAnswers(answers);
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    };
    fetchQuestionDetails();
  }, [questionId]);

  if (!question) {
    return <p>Loading...</p>;
  }

  return (
    <div className="question-details">
      <h1>{question.heading}</h1>
      <p>{question.subheading}</p>
      <h2>Answers</h2>
      {answers.map((answer) => (
        <div key={answer.id} className="answer">
          <p>{answer.banyanFileId}</p> {/* Assuming banyanFileId contains the answer content */}
          <p>Author: {answer.author}</p>
        </div>
      ))}
    </div>
  );
};

export default QuestionDetails;
