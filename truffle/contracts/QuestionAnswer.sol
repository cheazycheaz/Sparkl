// SPDX-License-Identifier: MIT

/* This smart contract provides the basic functionality for storing and retrieving 
question and answer metadata on the Base blockchain. The actual content
associated with the questions and answers are stored on IPFS, and this contract just stores
the IPFS file hashes as references.

Also implements bounty system, reputation/points distribution, defines user profiles, tags, categories, 
and achievement badges.
*/
pragma solidity ^0.8.3;

contract QuestionAnswer {
    struct Question {
        uint256 id;
        string heading;
        string subheading;
        string ipfsHash;
        uint256 timestamp;
        uint256 views;
        uint256 bountyAmount;
        address[] bountyProposers;
        mapping(address => uint256) bounties;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string ipfsHash;
        address author;
        uint256 timestamp;
        uint256 views;
        uint256 likes;
        bool isDraft;
        bool hasBounty;
    }

    struct User {
        address userAddress;
        string name;
        string bio;
        string twitterLink;
        string websiteLink;
        string profilePicture;
        string username;
        string occupation;
        uint256 points;
        uint256 reputation;
        uint256 lastActivity;
    }

    uint256 public questionCount;
    uint256 public answerCount;
    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(address => User) public users;
    mapping(address => uint256[]) public userAnswers;
    mapping(uint256 => uint256[]) public questionAnswers;

    // Events
    event QuestionPosted(uint256 indexed questionId, string heading, string subheading, string ipfsHash, uint256 timestamp);
    event AnswerPosted(uint256 indexed answerId, uint256 indexed questionId, string ipfsHash, address author, uint256 timestamp);
    event AnswerLiked(uint256 indexed answerId, address indexed liker);
    event BountyProposed(uint256 indexed questionId, address indexed proposer, uint256 amount);
    event BountyClaimed(uint256 indexed questionId, uint256 indexed answerId, address indexed claimer, uint256 amount);

    // Modifier to check if user exists
    modifier userExists(address user) {
        require(users[user].userAddress != address(0), "User does not exist");
        _;
    }

    // Modifier to check if question exists
    modifier questionExists(uint256 questionId) {
        require(questionId > 0 && questionId <= questionCount, "Question does not exist");
        _;
    }

    // Modifier to check if answer exists
    modifier answerExists(uint256 answerId) {
        require(answerId > 0 && answerId <= answerCount, "Answer does not exist");
        _;
    }

    // Function to register a new user
    function registerUser(
        string memory name,
        string memory bio,
        string memory twitterLink,
        string memory websiteLink,
        string memory profilePicture,
        string memory username,
        string memory occupation
    ) public {
        require(users[msg.sender].userAddress == address(0), "User already exists");
        users[msg.sender] = User(msg.sender, name, bio, twitterLink, websiteLink, profilePicture, username, occupation, 0, 0, block.timestamp);
    }

    // Function to post a new question
    function postQuestion(
        string memory heading,
        string memory subheading,
        string memory ipfsHash
    ) public userExists(msg.sender) {
        require(bytes(heading).length <= 150, "Heading exceeds character limit");
        require(bytes(subheading).length <= 400, "Subheading exceeds character limit");

        questionCount++;
        Question storage newQuestion = questions[questionCount];
        newQuestion.id = questionCount;
        newQuestion.heading = heading;
        newQuestion.subheading = subheading;
        newQuestion.ipfsHash = ipfsHash;
        newQuestion.timestamp = block.timestamp;
        newQuestion.views = 0;
        newQuestion.bountyAmount = 0;
        
        emit QuestionPosted(questionCount, heading, subheading, ipfsHash, block.timestamp);
    }

    // Function to post a new answer
    function postAnswer(
        uint256 questionId,
        string memory ipfsHash,
        bool isDraft
    ) public userExists(msg.sender) questionExists(questionId) {
        answerCount++;
        answers[answerCount] = Answer(answerCount, questionId, ipfsHash, msg.sender, block.timestamp, 0, 0, isDraft, questions[questionId].bountyAmount > 0);

        userAnswers[msg.sender].push(answerCount);
        questionAnswers[questionId].push(answerCount);

        emit AnswerPosted(answerCount, questionId, ipfsHash, msg.sender, block.timestamp);
    }

    // Function to like an answer
    function likeAnswer(uint256 answerId) public userExists(msg.sender) answerExists(answerId) {
        answers[answerId].likes++;
        emit AnswerLiked(answerId, msg.sender);
    }

    // Function to propose a bounty for a question
    function proposeBounty(uint256 questionId, uint256 amount) public payable userExists(msg.sender) questionExists(questionId) {
        require(msg.value == amount, "Amount mismatch with sent value");
        Question storage q = questions[questionId];
        q.bounties[msg.sender] += amount;
        q.bountyAmount += amount;
        q.bountyProposers.push(msg.sender);
        emit BountyProposed(questionId, msg.sender, amount);
    }

    // Function to claim a bounty for an answered question
    function claimBounty(uint256 questionId, uint256 answerId) public userExists(msg.sender) questionExists(questionId) answerExists(answerId) {
        require(answers[answerId].author == msg.sender, "Only the author can claim the bounty");
        require(answers[answerId].questionId == questionId, "Answer does not belong to the question");
        require(answers[answerId].hasBounty, "No bounty associated with this answer");

        uint256 totalBounty = questions[questionId].bountyAmount;
        uint256 appFee = (totalBounty * 10) / 100;
        uint256 authorAmount = totalBounty - appFee;

        // Transfer bounty to the author
        payable(msg.sender).transfer(authorAmount);
        questions[questionId].bountyAmount = 0;
        answers[answerId].hasBounty = false;

        emit BountyClaimed(questionId, answerId, msg.sender, authorAmount);
    }

    // Function to update user points
    function updateUserPoints(address user, uint256 points) internal {
        users[user].points += points;
    }

    // Function to update question views
    function updateQuestionViews(uint256 questionId) public questionExists(questionId) {
        questions[questionId].views++;
    }

    // Function to update answer views
    function updateAnswerViews(uint256 answerId) public answerExists(answerId) {
        answers[answerId].views++;
    }

    // Additional helper functions for fetching data can be added here
}
