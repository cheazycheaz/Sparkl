// client/MyComponent.tsx
import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import PrivyWrapper from './PrivyWrapper';

const MyComponent: React.FC = () => {
  const privy = usePrivy();

  const handleButtonClick = () => {
    privy.login(); // Use the correct method from usePrivy hook
  };

  return (
    <PrivyWrapper>
      <button onClick={handleButtonClick}>Spark my curiosity</button>
    </PrivyWrapper>
  );
};

export default MyComponent;
