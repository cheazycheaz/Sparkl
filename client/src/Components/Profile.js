// sparkl/client/src/components/Profile.js
import React, { useState } from 'react';
import client from '../privyConfig';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    twitterLink: '',
    websiteLink: '',
    profilePicture: '',
    username: '',
    occupation: '',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.updateProfile(profile);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
      <input name="bio" value={profile.bio} onChange={handleChange} placeholder="Bio" />
      <input name="twitterLink" value={profile.twitterLink} onChange={handleChange} placeholder="Twitter" />
      <input name="websiteLink" value={profile.websiteLink} onChange={handleChange} placeholder="Website" />
      <input name="profilePicture" value={profile.profilePicture} onChange={handleChange} placeholder="Profile Picture" />
      <input name="username" value={profile.username} onChange={handleChange} placeholder="Username" />
      <input name="occupation" value={profile.occupation} onChange={handleChange} placeholder="Occupation" />
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default Profile;
