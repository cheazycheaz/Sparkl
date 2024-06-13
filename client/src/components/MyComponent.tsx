// client/src/components/MyComponent.tsx
import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import PrivyWrapper from './PrivyWrapper';

const MyComponent: React.FC = () => {
  const privy = usePrivy();

  const handleButtonClick = () => {
    if (privy && privy.login) {
      privy.login(); // Use the login method from usePrivy hook
    } else {
      console.error("Privy login method is not available.");
    }
  };

  return (
    <PrivyWrapper>
      <button onClick={handleButtonClick}>Spark my curiosity</button>
    </PrivyWrapper>
  );
};

export default MyComponent;