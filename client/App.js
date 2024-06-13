import React from 'react';
import Web3 from 'web3';
import axios from 'axios';
import privyClient from './client/src/utils/privy.js';
import { ethers } from 'ethers';

const web3 = new Web3('https://sepolia.base.org');
const contractAddress = '0xD8d2fb6609C22e1f3B5Bb17aD03671708d2c6583';
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


const apiKey = process.env.BANYAN_API_KEY;
const fileData = 'File content goes here';

axios.post('https://api.banyan.network/v1/files', fileData, {
  headers: {
    'Content-Type': 'text/plain',
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => {
  const fileId = response.data.fileId;
  console.log('File stored with ID:', fileId);
})
.catch(error => {
  console.error('Error storing file:', error);
});