import React, { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { db, storage } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaCopy } from 'react-icons/fa';
import { MdWork, MdSchool, MdLocationOn } from 'react-icons/md';
import { FaLightbulb } from 'react-icons/fa';
import UserBounties from './UserBounties';

const Profile = () => {
  const { user } = usePrivy();
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    profilePicture: '',
    employment: [],
    education: [],
    location: '',
    knowledgeableTopics: [],
    ethAddress: '',
  });
  const [imageUpload, setImageUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);

  const fetchUserProfile = async () => {
    if (user && user.id) {
      try {
        const userRef = ref(db, `users/${user.id}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfile(prevProfile => ({
            ...prevProfile,
            ...userData,
            ethAddress: user.wallet?.address || ''
          }));
          setInitialUsername(userData.username);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile({
        name: '',
        username: '',
        bio: '',
        profilePicture: '',
        employment: [],
        education: [],
        location: '',
        knowledgeableTopics: [],
        ethAddress: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (e.target.name === 'username') {
      setUsernameError('');
    }
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageUpload(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const usernameRef = ref(db, `usernames/${username}`);
      const snapshot = await get(usernameRef);
      
      if (snapshot.exists() && snapshot.val() === user.id) {
        return true;
      }
      
      return !snapshot.exists();
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name) newErrors.name = "Name is required";
    if (!profile.username) newErrors.username = "Username is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setUsernameError('');
    setSaveError(null);

    if (!user || !user.id) {
      console.error("User not authenticated");
      setIsSaving(false);
      return;
    }


    
    try {
      if (profile.username !== initialUsername) {
        const isUsernameAvailable = await checkUsernameAvailability(profile.username);
        if (!isUsernameAvailable) {
          setUsernameError('Username is already taken');
          setIsSaving(false);
          return;
        }
      }

      if (imageUpload) {
        const imageRef = storageRef(storage, `profilePictures/${user.id}/${Date.now()}_${imageUpload.name}`);
        await uploadBytes(imageRef, imageUpload);
        const downloadURL = await getDownloadURL(imageRef);
        profile.profilePicture = downloadURL;
      }

      const userRef = ref(db, `users/${user.id}`);
      await set(userRef, profile);

      if (profile.username !== initialUsername) {
        await set(ref(db, `usernames/${profile.username}`), user.id);
        if (initialUsername) {
          await set(ref(db, `usernames/${initialUsername}`), null);
        }
      }

      setInitialUsername(profile.username);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
      setIsEditing(false);
      fetchUserProfile();
    }
  };

  const addCredential = (type) => {
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], { title: '', company: '' }]
    }));
  };

  const updateCredential = (type, index, field, value) => {
    const updatedCredentials = [...profile[type]];
    updatedCredentials[index][field] = value;
    setProfile(prev => ({ ...prev, [type]: updatedCredentials }));
  };

  const copyEthAddress = () => {
    navigator.clipboard.writeText(profile.ethAddress);
    alert('ETH address copied to clipboard!');
  };

  const addTopic = () => {
    if (newTopic && !profile.knowledgeableTopics.includes(newTopic)) {
      setProfile(prev => ({ ...prev, knowledgeableTopics: [...prev.knowledgeableTopics, newTopic] }));
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove) => {
    setProfile(prev => ({ ...prev, knowledgeableTopics: prev.knowledgeableTopics.filter(topic => topic !== topicToRemove) }));
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleSubmit();
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-sparkl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6666FF]">Profile</h1>
        <button
          onClick={toggleEditMode}
          className="bg-[#6666FF] hover:bg-[#5555DD] text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="flex items-start mb-8">
            <div className="mr-8">
              <img
                src={profile.profilePicture || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover cursor-pointer"
                onClick={handleImageClick}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {usernameError && <p className="text-red-500 text-xs italic">{usernameError}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Employment</label>
            {profile.employment.map((job, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={job.title}
                  onChange={(e) => updateCredential('employment', index, 'title', e.target.value)}
                  placeholder="Job Title"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
                <input
                  type="text"
                  value={job.company}
                  onChange={(e) => updateCredential('employment', index, 'company', e.target.value)}
                  placeholder="Company"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
              </div>
            ))}
            <button type="button" onClick={() => addCredential('employment')} className="text-sm text-[#6666FF] underline mt-2">
              + Add employment
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Education</label>
            {profile.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={edu.title}
                  onChange={(e) => updateCredential('education', index, 'title', e.target.value)}
                  placeholder="Degree"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
                <input
                  type="text"
                  value={edu.description}
                  onChange={(e) => updateCredential('education', index, 'description', e.target.value)}
                  placeholder="Institution"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
              </div>
            ))}
            <button type="button" onClick={() => addCredential('education')} className="text-sm text-[#6666FF] underline mt-2">
              + Add education
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Knowledgeable Topics</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.knowledgeableTopics.map((topic, index) => (
                <span key={index} className="bg-[#6666FF] text-white text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {topic}
                  <button type="button" onClick={() => removeTopic(topic)} className="ml-2 text-white">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Add a topic"
              />
              <button type="button" onClick={addTopic} className="ml-2 bg-[#6666FF] hover:bg-[#5555DD] text-white font-bold py-2 px-4 rounded">
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ethAddress">
              ETH Address
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="ethAddress"
                name="ethAddress"
                value={profile.ethAddress}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button type="button" onClick={copyEthAddress} className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                <FaCopy />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="bg-[#6666FF] hover:bg-[#5555DD] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Read-only profile view
        <div>
          <div className="flex flex-col items-center mb-8">
            <img
              src={profile.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">@{profile.username}</p>
            <p className="mt-2 text-center">{profile.bio}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="font-mono bg-gray-100 p-1 rounded">{profile.ethAddress}</span>
              <button onClick={copyEthAddress} className="ml-2 text-[#6666FF]">
                <FaCopy />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-2 text-[#6666FF] flex items-center">
                <MdWork className="mr-2" /> Employment
              </h2>
              {profile.employment.map((job, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-gray-600">{job.company}</p>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 text-[#6666FF] flex items-center">
                <MdSchool className="mr-2" /> Education
              </h2>
              {profile.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <p className="font-semibold">{edu.title}</p>
                  <p className="text-gray-600">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2 text-[#6666FF] flex items-center">
              <FaLightbulb className="mr-2" /> Knowledgeable Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.knowledgeableTopics.map((topic, index) => (
                <span key={index} className="bg-[#6666FF] text-white text-sm font-medium px-3 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <MdLocationOn className="text-[#6666FF] mr-2" />
            <span className="font-semibold">Location:</span>
            <span className="ml-2">{profile.location}</span>
          </div>
        </div>
      )}

      {saveSuccess && <p className="text-green-500 mt-4">Profile saved successfully!</p>}
      {saveError && <p className="text-red-500 mt-4">{saveError}</p>}

      <UserBounties userAddress={user.wallet.address} />
    </div>
  );
};

export default Profile;
