import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';

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

function Question() {
  const [question, setQuestion] = useState({
    heading: '',
    subheading: '',
    content: ''
  });

  const postQuestion = async () => {
    try {
      const apiKey = process.env.REACT_APP_BANYAN_API_KEY;
      const fileData = question.content;
      const response = await axios.post('https://api.banyan.network/v1/files', fileData, {
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const fileId = response.data.fileId;
      console.log('File stored with ID:', fileId);

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      contract.methods.addQuestion(fileId).send({ from: account })
        .then(() => {
          console.log('Question posted successfully');
        })
        .catch((error) => {
          console.error('Error posting question:', error);
        });
    } catch (error) {
      console.error('Error storing file:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Ask a Question</h2>
      <div className="mt-4 p-4 bg-white rounded-xl shadow">
        <input
          type="text"
          placeholder="Heading"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={question.heading}
          onChange={(e) => setQuestion({ ...question, heading: e.target.value })}
        />
        <input
          type="text"
          placeholder="Subheading"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={question.subheading}
          onChange={(e) => setQuestion({ ...question, subheading: e.target.value })}
        />
        <textarea
          placeholder="Question Content"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={question.content}
          onChange={(e) => setQuestion({ ...question, content: e.target.value })}
        ></textarea>
        <button onClick={postQuestion} className="mt-2 px-4 py-2 bg-primary text-white rounded-full">Post Question</button>
      </div>
    </div>
  );
}

export default Question;
