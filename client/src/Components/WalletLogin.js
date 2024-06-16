import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const WalletLogin = () => {
  const { login, user } = usePrivy();
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
    }
  };

  return (
    <div className="wallet-login">
      {user ? (
        <p>Welcome, {user.id}</p>
      ) : (
        <div>
          <button onClick={connectWallet} className="btn-connect">
            Connect Wallet
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletLogin;
