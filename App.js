import React from 'react';
import Web3 from 'web3';
import axios from 'axios';

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