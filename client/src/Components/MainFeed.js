import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContract } from '../contracts';

const MainFeed = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([
    { name: 'Cooking', followers: '63.4M' },
    { name: 'Technology', followers: '45.2M' },
    { name: 'Science', followers: '38.9M' },
    // Add more topics as needed
  ]);

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
            title: question.question,
            details: question.details,
            author: question.author,
            timestamp: new Date(question.timestamp * 1000).toLocaleString(),
          });
        }

        setQuestions(questionsArray);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <div className="w-1/4 p-4">
        <button className="mb-4 bg-red-500 text-white px-4 py-2 rounded">Create Space</button>
        <ul>
          {topics.slice(0, 5).map((topic, index) => (
            <li key={index} className="mb-2">
              <Link to={`/topic/${topic.name}`} className="text-gray-700 hover:text-gray-900">
                {topic.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Latest Questions</h2>
        {questions.map((question) => (
          <div key={question.id} className="mb-6 p-4 bg-white rounded-lg shadow">
            <Link to={`/question/${question.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {question.title}
            </Link>
            <p className="text-gray-600 mt-2">{question.details}</p>
            <div className="mt-2 text-sm text-gray-500">
              Asked by {question.author} on {question.timestamp}
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="w-1/4 p-4">
        <h3 className="font-bold mb-2">Related Topics</h3>
        <ul>
          {topics.map((topic, index) => (
            <li key={index} className="mb-2">
              <Link to={`/topic/${topic.name}`} className="text-gray-700 hover:text-gray-900">
                {topic.name} - {topic.followers} followers
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MainFeed;