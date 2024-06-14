import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Web3 from 'web3';

const web3 = new Web3('https://sepolia.base.org');
const contractAddress = '0x80AE34024157d3d7aa590D2EdBD7F7083fD2e064';
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "answerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "name": "AnswerAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "questionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "QuestionAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "answers",
      "outputs": [
        {
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "questionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "questions",
      "outputs": [
        {
          "internalType": "string",
          "name": "banyanFileId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "answerCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_banyanFileId",
          "type": "string"
        }
      ],
      "name": "addQuestion",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_banyanFileId",
          "type": "string"
        }
      ],
      "name": "addAnswer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_answerId",
          "type": "uint256"
        }
      ],
      "name": "getQuestion",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_questionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_answerId",
          "type": "uint256"
        }
      ],
      "name": "getAnswer",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
const contract = new web3.eth.Contract(contractABI, contractAddress);

function Profile() {
  const { user } = usePrivy();
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    occupation: '',
    profilePicture: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userProfile = await contract.methods.users(user.address).call();
          setProfile({
            name: userProfile.name,
            username: userProfile.username,
            bio: userProfile.bio,
            occupation: userProfile.occupation,
            profilePicture: userProfile.profilePicture
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const updateProfile = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      await contract.methods.updateProfile(
        profile.name,
        profile.username,
        profile.bio,
        profile.occupation,
        profile.profilePicture
      ).send({ from: account });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Profile</h2>
      <div className="mt-4 p-4 bg-white rounded-xl shadow">
        <img src={profile.profilePicture} alt="Profile" className="h-24 w-24 rounded-full mb-4" />
        <input
          type="text"
          placeholder="Name"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Username"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={profile.username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
        />
        <input
          type="text"
          placeholder="Bio"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        />
        <input
          type="text"
          placeholder="Occupation"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={profile.occupation}
          onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
        />
        <input
          type="text"
          placeholder="Profile Picture URL"
          className="block mb-2 p-2 w-full border border-gray-300 rounded"
          value={profile.profilePicture}
          onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })}
        />
        <button onClick={updateProfile} className="mt-2 px-4 py-2 bg-primary text-white rounded-full">Update Profile</button>
      </div>
    </div>
  );
}

export default Profile;
