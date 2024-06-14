import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState({});
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const question = await contract.methods.questions(id).call();
        setQuestion(question);
        const answerCount = await contract.methods.questionAnswers(id).call();
        const answers = [];
        for (let i = 1; i <= answerCount.length; i++) {
          const answer = await contract.methods.answers(i).call();
          answers.push(answer);
        }
        setAnswers(answers);
      } catch (error) {
        console.error("Error fetching question details:", error);
      }
    };
    fetchQuestionDetails();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold">{question.banyanFileId}</h2>
      <div className="text-gray-500">Views: {question.views} | Likes: {question.likes}</div>
      <div className="mt-4 p-4 bg-white rounded-xl shadow">
        <h3 className="text-xl font-semibold">Answers</h3>
        {answers.map((answer, index) => (
          <div key={index} className="mb-4">
            <div className="text-gray-700">{answer.banyanFileId}</div>
            <div className="text-gray-500">Likes: {answer.likes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionDetail;
