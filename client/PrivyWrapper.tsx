// client/PrivyWrapper.tsx
import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

interface PrivyWrapperProps {
  children: ReactNode;
}

const PrivyWrapper: React.FC<PrivyWrapperProps> = ({ children }) => {
  return (
    <PrivyProvider appId="clx9jtfgm08in7t5z52xwr2oy">
      {children}
    </PrivyProvider>
  );
};

export default PrivyWrapper;
