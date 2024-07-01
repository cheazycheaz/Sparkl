// App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { signInWithPrivy, auth } from './firebase';
import { signOut } from 'firebase/auth';
import WalletLogin from './Components/WalletLogin';
import Profile from './Components/Profile';
import PostQuestion from './Components/PostQuestion';
import PostAnswer from './Components/PostAnswer';
import ProposeBounty from './Components/ProposeBounty';
import AnswerList from './Components/AnswerList';
import MainFeed from './Components/MainFeed';
import TopicPage from './Components/TopicPage';
import QuestionDetails from './Components/QuestionDetails';
import { FaSearch } from 'react-icons/fa';
import './App.css';

const topicTags = [
  "Technology", "Crypto", "Finance", "Science", "Politics", "Health", "Environment",
  "Education", "Business", "Entertainment", "Sports", "Travel"
];

function App() {
  const { user, logout } = usePrivy();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      signInWithPrivy(user.id).then(success => {
        if (success) {
          console.log("Successfully signed in with Firebase");
        } else {
          console.error("Failed to sign in with Firebase");
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      await signOut(auth);
      console.log("Successfully logged out from both Privy and Firebase");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <Router>
      <div className="App font-satoshi">
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center">
                <img src="/Sparkl.png" alt="Sparkl Logo" className="h-8 mr-2" />
              </Link>
              <form onSubmit={handleSearch} className="flex-grow mx-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search topics and keywords"
                    className="w-full px-4 py-2 rounded-full border focus:outline-none focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSearch className="text-gray-400" />
                  </button>
                </div>
              </form>
              <ul className="flex items-center">
                {user ? (
                  <>
                    <li className="mr-4"><Link to="/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
                    <li className="mr-4"><Link to="/post-question" className="bg-[#6666ff] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Add Question</Link></li>
                    <li><button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">Logout</button></li>
                  </>
                ) : (
                  <li><WalletLogin /></li>
                )}
              </ul>
            </div>
          </nav>
        </header>
        <div className="container mx-auto px-6 py-8 flex">
          <aside className="w-1/4 pr-8">
            <h3 className="text-xl font-bold mb-4">Popular Topics</h3>
            <ul>
              {topicTags.map((topic, index) => (
                <li key={index} className="mb-2">
                  <Link to={`/topic/${encodeURIComponent(topic)}`} className="text-indigo-600 hover:text-indigo-800">
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <main className="w-3/4">
            <Routes>
              <Route path="/" element={<MainFeed />} />
              <Route path="/login" element={<WalletLogin />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/post-question" element={user ? <PostQuestion /> : <Navigate to="/login" />} />
              <Route path="/question/:questionId" element={<QuestionDetails />} />
              <Route path="/post-answer/:questionId" element={user ? <PostAnswer /> : <Navigate to="/login" />} />
              <Route path="/propose-bounty/:questionId" element={user ? <ProposeBounty /> : <Navigate to="/login" />} />
              <Route path="/answers/:questionId" element={<AnswerList />} />
              <Route path="/topic/:topicName" element={<TopicPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;