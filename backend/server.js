const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    bio: String,
    twitterLink: String,
    websiteLink: String,
    profilePicture: String,
    username: String,
    occupation: String,
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/api/users', (req, res) => {
    const newUser = new User(req.body);
    newUser.save()
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

app.get('/api/users/:username', (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
