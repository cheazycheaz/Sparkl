import React, { useState, useEffect } from 'react';
import SparkleSpinner from './SparkleSpinner';
import { Link } from 'react-router-dom';
import { getContract } from '../contracts';
import axios from 'axios';

const MainFeed = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeTags = (content) => {
    if (!content) return '';
    content = content.trim();
    return content.replace(/<\/?[^>]+(>|$)/g, '');
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const contract = await getContract();
        const questionCount = await contract.questionCount();
        
        const fetchedQuestions = await Promise.all(
          Array.from({ length: questionCount.toNumber() }, (_, i) => i + 1).map(async (id) => {
            const question = await contract.questions(id);
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${question.ipfsHash}`);
            return { 
              ...response.data, 
              id: id.toString(), 
              author: question.author,
              details: removeTags(response.data.details)
            };
          })
        );

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SparkleSpinner />
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div>
      {questions.map(question => (
        <div key={question.id} className="mb-6 p-4 bg-white rounded-lg shadow">
          <Link to={`/question/${question.id}`} className="text-xl font-bold text-blue-600 hover:text-blue-800">
            {question.heading}
          </Link>
          <p className="text-gray-600 mt-2">{question.details}</p>
          <div className="mt-2">
            {question.topics && question.topics.map((topic, index) => (
              <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {topic}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainFeed;