import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import WalletLogin from './Components/WalletLogin';
import Profile from './Components/Profile';
import QuestionFeed from './Components/QuestionFeed';
import PostQuestion from './Components/PostQuestion';
import PostAnswer from './Components/PostAnswer';
import ProposeBounty from './Components/ProposeBounty';
import AnswerList from './Components/AnswerList';
import './App.css';
import 'process/browser';
import { Buffer } from 'buffer';





function App() {
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error('User denied account access');
        }
      } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    checkConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/feed">Questions</Link></li>
              <li><Link to="/post-question">Post Question</Link></li>
              <li><Link to="/propose-bounty">Propose Bounty</Link></li>
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/login" element={<WalletLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<QuestionFeed />} />
          <Route path="/post-question" element={<PostQuestion />} />
          <Route path="/post-answer/:questionId" element={<PostAnswer />} />
          <Route path="/propose-bounty/:questionId" element={<ProposeBounty />} />
          <Route path="/answers/:questionId" element={<AnswerList />} />
          <Route path="/" element={
            <div>
              <h1>Welcome to Sparkl</h1>
              <p>Your on-chain question and answer platform.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
