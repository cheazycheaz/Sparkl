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

function Answer() {
  const [answer, setAnswer] = useState({
    content: '',
    questionId: 1 // For simplicity, assuming answering question ID 1
  });

  const postAnswer = async () => {
    try {
      const apiKey = process.env.REACT_APP_BANYAN_API_KEY;
      const fileData = answer.content;
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
      contract.methods.addAnswer(answer.questionId, fileId).send({ from: account })
        .then(() => {
          console.log('Answer posted successfully');
        })
        .catch((error) => {
          console.error('Error posting answer:', error);
        });
    } catch (error) {
      console.error('Error storing file:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Answer the Question</h2>
      <div className="mt-4 p-4 bg-white rounded-xl shadow">
        <textarea
          placeholder="Answer Content"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={answer.content}
          onChange={(e) => setAnswer({ ...answer, content: e.target.value })}
        ></textarea>
        <button onClick={postAnswer} className="mt-2 px-4 py-2 bg-primary text-white rounded-full">Post Answer</button>
      </div>
    </div>
  );
}

export default Answer;
