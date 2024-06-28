import React, { useEffect } from 'react';
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
import './App.css';

function App() {
  const { user, logout } = usePrivy();

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
      // Sign out from Privy
      await logout();
      
      // Sign out from Firebase
      await signOut(auth);
      
      console.log("Successfully logged out from both Privy and Firebase");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-6 py-3">
            <ul className="flex justify-between items-center">
              <li><Link to="/" className="text-xl font-bold text-gray-800">Sparkl</Link></li>
              {user ? (
                <>
                  <li><Link to="/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
                  <li><Link to="/post-question" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Add Question</Link></li>
                  <li><button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">Logout</button></li>
                </>
              ) : (
                <li><WalletLogin /></li>
              )}
            </ul>
          </nav>
        </header>
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<MainFeed />} />
            <Route path="/login" element={<WalletLogin />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/post-question" element={user ? <PostQuestion /> : <Navigate to="/login" />} />
            <Route path="/post-answer/:questionId" element={user ? <PostAnswer /> : <Navigate to="/login" />} />
            <Route path="/propose-bounty/:questionId" element={user ? <ProposeBounty /> : <Navigate to="/login" />} />
            <Route path="/answers/:questionId" element={<AnswerList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;