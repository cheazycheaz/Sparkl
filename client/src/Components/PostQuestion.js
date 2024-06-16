import React, { useState } from 'react';
import { getContract } from '../contracts'; // Import contract.js

const PostQuestion = () => {
    const [question, setQuestion] = useState({
        heading: '',
        subheading: '',
        content: '', // This will be uploaded to Banyan
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setQuestion({ ...question, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Post question with content to Banyan and blockchain
            const banyanFileId = await uploadContentToBanyan(question.content);
            const contract = getContract();
            const tx = await contract.postQuestion(question.heading, question.subheading, banyanFileId);
            await tx.wait();
            setSuccess(true);
        } catch (error) {
            console.error('Error posting question:', error);
            setError(error.message);
        }
    };

    const uploadContentToBanyan = async (content) => {
        try {
            const response = await fetch('https://api.banyan.com/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();
            return data.contentId; // Assuming the response contains the content ID
        } catch (error) {
            throw new Error('Error uploading content to Banyan');
        }
    };

    return (
        <div className="post-question">
            <h2>Post a New Question</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="heading"
                    value={question.heading}
                    onChange={handleChange}
                    placeholder="Heading"
                    required
                />
                <input
                    name="subheading"
                    value={question.subheading}
                    onChange={handleChange}
                    placeholder="Subheading"
                    required
                />
                <textarea
                    name="content"
                    value={question.content}
                    onChange={handleChange}
                    placeholder="Question Content"
                    required
                />
                <button type="submit">Post Question</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Question posted successfully!</p>}
        </div>
    );
};

export default PostQuestion;
