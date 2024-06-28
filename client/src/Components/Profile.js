import React, { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { db, storage } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaCopy } from 'react-icons/fa';

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
    skills: [],
  });
  const [imageUpload, setImageUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const fileInputRef = useRef(null);

  const fetchUserProfile = async () => {
    console.log("Fetching user profile...");
    if (user && user.id) {
      try {
        console.log("User ID:", user.id);
        const userRef = ref(db, `users/${user.id}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          console.log("User data found:", snapshot.val());
          setProfile(prevProfile => ({
            ...prevProfile,
            ...snapshot.val(),
            ethAddress: user.wallet?.address || ''
          }));
        } else {
          console.log("No data available for this user");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    } else {
      console.log("No authenticated user available to fetch profile");
    }
  };

  useEffect(() => {
    console.log("Checking user authentication...");
    if (user) {
      console.log("User authenticated:", user);
      console.log("User ID:", user.id);
      console.log("User wallet address:", user.wallet?.address);
      fetchUserProfile();
    } else {
      console.log("User not authenticated");
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
        skills: [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (e.target.name === 'username') {
      setUsernameError('');
    }
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
      console.log("Checking availability for username:", username);
      const usernameRef = ref(db, `usernames/${username}`);
      const snapshot = await get(usernameRef);
      const isAvailable = !snapshot.exists();
      console.log("Username availability:", isAvailable);
      return isAvailable;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setUsernameError('');

    if (!user || !user.id) {
      console.error("User not authenticated");
      setIsSaving(false);
      return;
    }

    try {
      console.log("Starting profile update for user:", user.id);

      if (profile.username !== user.username) {
        const isUsernameAvailable = await checkUsernameAvailability(profile.username);
        if (!isUsernameAvailable) {
          setUsernameError('Username is already taken');
          setIsSaving(false);
          return;
        }
      }

      if (imageUpload) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${Date.now()}_${imageUpload.name}`);
        await uploadBytes(storageRef, imageUpload);
        const downloadURL = await getDownloadURL(storageRef);
        profile.profilePicture = downloadURL;
      }

      const userRef = ref(db, `users/${user.id}`);
      await set(userRef, profile);

      if (profile.username !== user.username) {
        await set(ref(db, `usernames/${profile.username}`), user.id);
        if (user.username) {
          await set(ref(db, `usernames/${user.username}`), null);
        }
      }

      setSaveSuccess(true);
      console.log("Profile updated successfully");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log("Cancelling profile edit");
    fetchUserProfile();
  };

  const addCredential = (type) => {
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], { title: '', description: '', startDate: '', endDate: '' }]
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

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
            Profile Picture
          </label>
          <div className="flex items-center">
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
        </div>
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
                value={job.description}
                onChange={(e) => updateCredential('employment', index, 'description', e.target.value)}
                placeholder="Job Description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                value={job.startDate}
                onChange={(e) => updateCredential('employment', index, 'startDate', e.target.value)}
                placeholder="Start Date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                value={job.endDate}
                onChange={(e) => updateCredential('employment', index, 'endDate', e.target.value)}
                placeholder="End Date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
          ))}
          <button type="button" onClick={() => addCredential('employment')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Employment
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
              <input
                type="text"
                value={edu.startDate}
                onChange={(e) => updateCredential('education', index, 'startDate', e.target.value)}
                placeholder="Start Date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                value={edu.endDate}
                onChange={(e) => updateCredential('education', index, 'endDate', e.target.value)}
                placeholder="End Date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
            </div>
          ))}
          <button type="button" onClick={() => addCredential('education')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Education
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="knowledgeableTopics">
            Knowledgeable Topics (comma-separated)
          </label>
          <input
            type="text"
            id="knowledgeableTopics"
            name="knowledgeableTopics"
            value={profile.knowledgeableTopics.join(', ')}
            onChange={(e) => setProfile({ ...profile, knowledgeableTopics: e.target.value.split(',').map(topic => topic.trim()) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Add a skill"
            />
            <button type="button" onClick={addSkill} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
      {saveSuccess && <p className="text-green-500 mt-4">Profile saved successfully!</p>}
    </div>
  );
};

export default Profile;