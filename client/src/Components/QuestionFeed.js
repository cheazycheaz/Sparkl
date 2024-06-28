import React, { useState, useEffect } from 'react';
import 'process/browser';
import { Link } from 'react-router-dom';
import { getContract } from '../contracts';

const QuestionFeed = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const contract = await getContract();
        const questionCount = await contract.questionCount();
        const questionsArray = [];

        for (let i = 1; i <= questionCount; i++) {
          const question = await contract.questions(i);
          questionsArray.push({
            id: i,
            heading: question.question,
            subheading: question.details,
            views: question.views.toString(),
            bountyAmount: question.bountyAmount.toString()
          });
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
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Questions</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {questions.map((question) => (
        <div key={question.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
          <Link to={`/question/${question.id}`} className="text-xl font-semibold text-blue-600 hover:underline">{question.heading}</Link>
          <p className="text-gray-600 mt-2">{question.subheading}</p>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Views: {question.views}</span>
            <span>Bounty: {question.bountyAmount} ETH</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionFeed;