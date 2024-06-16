// sparkl/client/src/components/PostAnswer.js
import React, { useState } from 'react';
import client from '../privyConfig';

const PostAnswer = ({ questionId }) => {
  const [answer, setAnswer] = useState({
    banyanFileId: '',
    isDraft: false,
  });

  const handleChange = (e) => {
    setAnswer({ ...answer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.postAnswer(questionId, answer);
      alert('Answer posted successfully');
    } catch (error) {
      console.error('Error posting answer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="banyanFileId" value={answer.banyanFileId} onChange={handleChange} placeholder="Banyan File ID" />
      <label>
        <input type="checkbox" name="isDraft" checked={answer.isDraft} onChange={(e) => setAnswer({ ...answer, isDraft: e.target.checked })} />
        Save as draft
      </label>
      <button type="submit">Post Answer</button>
    </form>
    );
};

export default PostAnswer;