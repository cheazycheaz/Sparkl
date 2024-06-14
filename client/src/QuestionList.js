import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';

const web3 = new Web3('https://sepolia.base.org');
const contractAddress = '0x80AE34024157d3d7aa590D2EdBD7F7083fD2e064';
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "answerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "name": "AnswerAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "QuestionAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "answers",
      "outputs": [
        {
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "questionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "questions",
      "outputs": [
        {
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "answerCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_banyanFileId",
          "type": "string"
        }
      ],
      "name": "addQuestion",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_banyanFileId",
          "type": "string"
        }
      ],
      "name": "addAnswer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_answerId",
          "type": "uint256"
        }
      ],
      "name": "getQuestion",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_answerId",
          "type": "uint256"
        }
      ],
      "name": "getAnswer",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
const contract = new web3.eth.Contract(contractABI, contractAddress);

function QuestionList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionCount = await contract.methods.questionCount().call();
        const questions = [];
        for (let i = 1; i <= questionCount; i++) {
          const question = await contract.methods.questions(i).call();
          questions.push(question);
        }
        setQuestions(questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Questions</h2>
      <ul className="mt-4">
        {questions.map((question, index) => (
          <li key={index} className="mb-4 p-4 bg-white rounded-xl shadow">
            <Link to={`/question/${index + 1}`} className="text-primary font-semibold">{question.banyanFileId}</Link>
            <div className="text-gray-500">Views: {question.views} | Likes: {question.likes}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionList;
