import React, { useState, useEffect, useCallback } from 'react';
import SparkleSpinner from './SparkleSpinner';
import { useParams, Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { ethers } from 'ethers';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { getContract } from '../contracts';
import ProposeBounty from './ProposeBounty';

const QuestionDetails = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { user } = usePrivy();
  const [sortBy, setSortBy] = useState('popular');
  const [userBounties, setUserBounties] = useState([]);

  const removeTags = (content) => {
    if (!content) return '';
    content = content.trim();
    return content.replace(/<\/?[^>]+(>|$)/g, '');
  };

  const handleEditAnswer = (answer) => {
    setNewAnswer(answer.content);
    setEditMode(true);
    setUserAnswer(answer);
  };

  const fetchQuestionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract();
      
      // Fetch question details
      const questionData = await contract.questions(questionId);
      if (!questionData.ipfsHash) {
        throw new Error("Question not found");
      }
      
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${questionData.ipfsHash}`);
      const questionAuthorRef = ref(db, `users/${questionData.author}`);
      const questionAuthorSnapshot = await get(questionAuthorRef);
      const questionAuthorData = questionAuthorSnapshot.val() || {};

      setQuestion({ 
        ...response.data, 
        id: questionId, 
        author: questionData.author,
        authorName: questionAuthorData.name || 'Anonymous',
        timestamp: new Date(questionData.timestamp.toNumber() * 1000).toLocaleString(),
      });
      
      // Fetch answers
      const answerIds = await contract.getQuestionAnswers(questionId);
      
      const fetchedAnswers = await Promise.all(answerIds.map(async (id) => {
        const answer = await contract.answers(id);
        const ipfsResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${answer.ipfsHash}`);
        // Fetch user data from firebase
        const userRef = ref(db, `users/${answer.author}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val() || {};
        
        return {
          id: id.toString(),
          content: removeTags(ipfsResponse.data.content),
          author: answer.author,
          authorName: userData.name || 'Anonymous',
          authorProfilePic: userData.profilePicture || '/default-avatar.png',
          timestamp: new Date(answer.timestamp.toNumber() * 1000).toLocaleString(),
          upvotes: answer.upvoteCount.toNumber(),
        };
      }));

      setAnswers(fetchedAnswers);
      
      if (user) {
        const userAnswerData = fetchedAnswers.find(answer => answer.author === user.wallet.address);
        if (userAnswerData) {
          setUserAnswer(userAnswerData);
        }
      }

      // Fetch bounties
      if (user) {
        const bounty = await contract.questionBounties(questionId, user.wallet.address);
        if (bounty.amount.gt(0)) {
          setUserBounties([{
            amount: ethers.utils.formatEther(bounty.amount),
            proposedAt: new Date(bounty.proposedAt.toNumber() * 1000).toLocaleString()
          }]);
        } else {
          setUserBounties([]);
        }
      }

    } catch (error) {
      console.error('Error fetching question details:', error);
      setError(error.message || 'Failed to load question details');
    } finally {
      setLoading(false);
    }
  }, [questionId, user]);

  useEffect(() => {
    fetchQuestionDetails();
  }, [fetchQuestionDetails]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to answer this question.');
      return;
    }
    if (!newAnswer.trim()) return;

    try {
      const contract = await getContract();
      const ipfsResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: { content: newAnswer }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.REACT_APP_PINATA_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET,
        }
      });

      const ipfsHash = ipfsResponse.data.IpfsHash;

      if (userAnswer) {
        await contract.updateAnswer(userAnswer.id, ipfsHash);
      } else {
        await contract.postAnswer(questionId, ipfsHash);
      }

      fetchQuestionDetails();
      setNewAnswer('');
      setEditMode(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleUpvote = async (answerId) => {
    if (!user) {
      alert('Please log in to upvote answers.');
      return;
    }

    try {
      const contract = await getContract();
      await contract.upvoteAnswer(answerId);
      fetchQuestionDetails();
    } catch (error) {
      console.error('Error upvoting answer:', error);
      alert('Failed to upvote answer. Please try again.');
    }
  };

  const handleShare = (answerId) => {
    const answerUrl = `${window.location.origin}/question/${questionId}#answer-${answerId}`;
    navigator.clipboard.writeText(answerUrl).then(() => {
      alert('Answer link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleClaimBounty = async (answerId) => {
    if (!user) {
      alert('Please log in to claim the bounty.');
      return;
    }
  
    try {
      const contract = await getContract();
      console.log("Claiming bounty for question:", questionId, "and answer:", answerId);
      console.log("User wallet address:", user.wallet.address);
      const tx = await contract.claimBounty(questionId, answerId);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      alert('Bounty claimed successfully!');
      fetchQuestionDetails();
    } catch (error) {
      console.error('Error claiming bounty:', error);
      alert('Failed to claim bounty. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SparkleSpinner />
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;
  if (!question) return <div>Question not found.</div>;

  const sortAnswers = (answers, sortBy) => {
    switch (sortBy) {
      case 'popular':
        return [...answers].sort((a, b) => b.upvotes - a.upvotes);
      case 'recent':
        return [...answers].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'oldest':
        return [...answers].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      default:
        return answers;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">{question.heading}</h1>
      <div className="text-lg text-gray-700 mb-6">{removeTags(question.details)}</div>
      <p className="text-sm text-gray-500 mb-4">Posted by {question.authorName} on {question.timestamp}</p>
      
      {user && userBounties.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Your Bounty for This Question</h3>
          <ul>
            {userBounties.map((bounty, index) => (
              <li key={index} className="mb-2">
                <p>Amount: {bounty.amount} ETH</p>
                <p>Proposed at: {bounty.proposedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="sort-answers" className="mr-2">Sort answers by:</label>
        <select
          id="sort-answers"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded p-1"
        >
          <option value="popular">Most Popular</option>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      
      {sortAnswers(answers, sortBy).map((answer) => (
        <div key={answer.id} id={`answer-${answer.id}`} className="mb-4 p-4 bg-gray-100 rounded-lg relative">
          <div className="flex items-start">
            <img src={answer.authorProfilePic} alt="Author" className="w-8 h-8 rounded-full mr-3" />
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm">{answer.authorName}</span>
                <div className="flex items-center">
                  <button
                    onClick={() => handleShare(answer.id)}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                    title="Share answer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  {user && answer.author === user.wallet.address && (
                    <button
                      onClick={() => handleEditAnswer(answer)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Edit answer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="text-gray-800 text-sm mb-2">{answer.content}</div>
              <p className="text-xs text-gray-500">
                Answered on {answer.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleUpvote(answer.id)}
            className="absolute bottom-2 right-2 text-gray-500 hover:text-red-500 focus:outline-none"
            title="Upvote answer"
            disabled={answer.hasUpvoted}
          >
            <svg className="w-5 h-5" fill={answer.hasUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs ml-1">{answer.upvotes}</span>
          </button>
          {user && answer.author === user.wallet.address && (
            <button
              onClick={() => handleClaimBounty(answer.id)}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Claim Bounty
            </button>
          )}
        </div>
      ))}

      {user ? (
        userAnswer && !editMode ? (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Your Answer</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              {userAnswer.content}
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Edit Answer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitAnswer} className="mt-8">
            <h3 className="text-xl font-bold mb-2">{editMode ? 'Edit Your Answer' : 'Your Answer'}</h3>
            <ReactQuill 
              value={newAnswer} 
              onChange={setNewAnswer}
              placeholder="Write your answer here..."
            />
            <button 
              type="submit" 
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
            >
              {editMode ? 'Update Answer' : 'Submit Answer'}
            </button>
          </form>
        )
      ) : (
        <p className="mt-8">
          Please <Link to="/login" className="text-indigo-600 hover:text-indigo-800">log in</Link> to answer this question.
        </p>
      )}

      <ProposeBounty questionId={questionId} />
    </div>
  );
};

export default QuestionDetails;