import React from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css';
import Profile from './Profile';
import Question from './Question';
import Answer from './Answer';
import QuestionList from './QuestionList';
import QuestionDetail from './QuestionDetail';
import Home from './Home';
import logo from './assets/sparkl-logo.png';

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

const privyAppId = 'clx9jtfgm08in7t5z52xwr2oy';

function App() {
  return (
    <PrivyProvider appId={privyAppId}>
      <Router>
        <div className="min-h-screen bg-secondary text-gray-900">
          <header className="w-full py-4 bg-white shadow-lg fixed top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={logo} alt="Sparkl Logo" className="h-8" />
                <nav className="flex space-x-4">
                  <Link to="/" className="text-primary font-semibold">Home</Link>
                  <Link to="/profile" className="text-primary font-semibold">Profile</Link>
                  <Link to="/question" className="text-primary font-semibold">Ask a Question</Link>
                  <Link to="/answer" className="text-primary font-semibold">Answer a Question</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <input type="text" placeholder="Search..." className="border rounded-full px-4 py-1" />
                <img src="https://via.placeholder.com/30" alt="Profile" className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </header>
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/question" element={<Question />} />
              <Route path="/answer" element={<Answer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PrivyProvider>
  );
}

export default App;
