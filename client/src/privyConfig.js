import { PrivyClient } from '@privy-io/react-auth';
import 'process/browser';
import { Buffer } from 'buffer';

const client = new PrivyClient({
  appId: 'clx9jtfgm08in7t5z52xwr2oy'
});



// Mock implementation of getQuestions and getQuestionDetails functions
client.getQuestions = async () => {
  return [
    { id: 1, heading: 'Sample Question 1', subheading: 'Sample Subheading 1' },
    { id: 2, heading: 'Sample Question 2', subheading: 'Sample Subheading 2' }
  ];
};

client.getQuestionDetails = async (questionId) => {
  return { id: questionId, heading: `Sample Question ${questionId}`, subheading: `Sample Subheading ${questionId}` };
};

client.getQuestionAnswers = async (questionId) => {
  return [
    { id: 1, questionId, banyanFileId: 'Answer Content 1', author: '0x123' },
    { id: 2, questionId, banyanFileId: 'Answer Content 2', author: '0x456' }
  ];
};

export default client;
