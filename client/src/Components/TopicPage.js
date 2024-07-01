import React, { useState, useEffect } from 'react';
import SparkleSpinner from './SparkleSpinner';
import { useParams, Link } from 'react-router-dom';
import { getContract } from '../contracts';
import axios from 'axios';

const TopicPage = () => {
  const { topicName } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeTags = (content) => {
    if (!content) return '';
    content = content.trim();
    return content.replace(/<\/?[^>]+(>|$)/g, '');
  };

  useEffect(() => {
    const fetchTopicQuestions = async () => {
      try {
        setLoading(true);
        const contract = await getContract();
        const questionCount = await contract.questionCount();
        
        const allQuestions = await Promise.all(
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

        const topicQuestions = allQuestions.filter(q => 
          q.topics && q.topics.map(t => t.toLowerCase()).includes(topicName.toLowerCase())
        );

        setQuestions(topicQuestions);
      } catch (error) {
        console.error('Error fetching topic questions:', error);
        setError('Failed to load questions for this topic. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicQuestions();
  }, [topicName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SparkleSpinner />
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Questions about {topicName}</h2>
      {questions.length === 0 ? (
        <p>No questions about {topicName} yet.</p>
      ) : (
        questions.map((question) => (
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
        ))
      )}
    </div>
  );
};

export default TopicPage;