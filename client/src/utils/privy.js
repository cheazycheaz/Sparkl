import { PrivyClient } from '@privy-io/react-auth';

let privyClient;

if (PrivyClient) {
  privyClient = new PrivyClient({
    apiKey: "clx9jtfgm08in7t5z52xwr2oy",
  });
} else {
  console.error("PrivyClient is not defined.");
}

// Attach privyClient to the window object
if (typeof window !== 'undefined' && privyClient) {
  window.Privy = privyClient;
}

export default privyClient;
