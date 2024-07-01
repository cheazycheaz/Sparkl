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
        string ipfsHash;
        uint256 timestamp;
        address author;
        uint256 views;
        uint256 bountyAmount;
        address[] bountyProposers;
    }

    struct Bounty {
        uint256 amount;
        uint256 proposedAt;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string ipfsHash;
        address author;
        uint256 timestamp;
        uint256 views;
        uint256 upvoteCount;
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
    mapping(uint256 => mapping(address => Bounty)) public questionBounties;
    mapping(uint256 => mapping(address => bool)) public answerUpvotes;

    uint256 public constant BOUNTY_DURATION = 2 weeks;

    // Events
    event QuestionPosted(uint256 indexed questionId, string ipfsHash, uint256 timestamp, address author);
    event AnswerPosted(uint256 indexed answerId, uint256 indexed questionId, string ipfsHash, address author, uint256 timestamp);
    event AnswerUpdated(uint256 indexed answerId, string newIpfsHash, uint256 timestamp);
    event AnswerUpvoted(uint256 indexed answerId, address indexed upvoter);
    event BountyProposed(uint256 indexed questionId, address indexed proposer, address indexed recipient, uint256 amount);    event BountyClaimed(uint256 indexed questionId, uint256 indexed answerId, address indexed claimer, uint256 amount);
    event BountyWithdrawn(uint256 indexed questionId, address indexed withdrawer, uint256 amount);

    address public owner;

    constructor() {
        owner = msg.sender;
        questionCount = 0;
        answerCount = 0;
    }

    // Modifiers
    modifier userExists(address user) {
        require(users[user].userAddress != address(0), "User does not exist");
        _;
    }

    modifier questionExists(uint256 questionId) {
        require(questionId > 0 && questionId <= questionCount, "Question does not exist");
        _;
    }

    modifier answerExists(uint256 answerId) {
        require(answerId > 0 && answerId <= answerCount, "Answer does not exist");
        _;
    }

    // Functions
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

    function postQuestion(string memory ipfsHash) public {
        questionCount = questionCount + 1;
        questions[questionCount] = Question(questionCount, ipfsHash, block.timestamp, msg.sender, 0, 0, new address[](0));
        emit QuestionPosted(questionCount, ipfsHash, block.timestamp, msg.sender);
    }

    function proposeBounty(uint256 _questionId, address _recipient) public payable questionExists(_questionId) {
        require(msg.value > 0, "Bounty amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.sender != _recipient, "Cannot propose bounty to yourself");
        
        questionBounties[_questionId][_recipient] = Bounty(msg.value, block.timestamp);
        questions[_questionId].bountyAmount += msg.value;
        questions[_questionId].bountyProposers.push(msg.sender);
        
        emit BountyProposed(_questionId, msg.sender, _recipient, msg.value);
    }

    function withdrawBounty(uint256 _questionId) public questionExists(_questionId) {
        Bounty memory bounty = questionBounties[_questionId][msg.sender];
        require(bounty.amount > 0, "No bounty to withdraw");
        require(block.timestamp > bounty.proposedAt + BOUNTY_DURATION, "Bounty still active");
        
        uint256 amount = bounty.amount;
        delete questionBounties[_questionId][msg.sender];
        questions[_questionId].bountyAmount -= amount;
        payable(msg.sender).transfer(amount);
        
        emit BountyWithdrawn(_questionId, msg.sender, amount);
    }

    function postAnswer(uint256 questionId, string memory ipfsHash) public questionExists(questionId) {
        answerCount++;
        answers[answerCount] = Answer(answerCount, questionId, ipfsHash, msg.sender, block.timestamp, 0, 0);

        userAnswers[msg.sender].push(answerCount);
        questionAnswers[questionId].push(answerCount);

        emit AnswerPosted(answerCount, questionId, ipfsHash, msg.sender, block.timestamp);
    }

    function updateAnswer(uint256 answerId, string memory newIpfsHash) public answerExists(answerId) {
        require(answers[answerId].author == msg.sender, "Only the author can update the answer");
        answers[answerId].ipfsHash = newIpfsHash;
        answers[answerId].timestamp = block.timestamp;
        emit AnswerUpdated(answerId, newIpfsHash, block.timestamp);
    }

    function upvoteAnswer(uint256 answerId) public userExists(msg.sender) answerExists(answerId) {
        require(!answerUpvotes[answerId][msg.sender], "User has already upvoted this answer");
        answerUpvotes[answerId][msg.sender] = true;
        answers[answerId].upvoteCount++;
        emit AnswerUpvoted(answerId, msg.sender);
    }

    function hasUpvoted(uint256 answerId, address user) public view returns (bool) {
        return answerUpvotes[answerId][user];
    }

    function claimBounty(uint256 questionId, uint256 answerId) public {
        require(answers[answerId].author == msg.sender, "Only the answer author can claim the bounty");
        require(answers[answerId].questionId == questionId, "Answer does not belong to the question");
        
        Bounty memory bounty = questionBounties[questionId][msg.sender];
        require(bounty.amount > 0, "No bounty available for claiming");

        uint256 totalAmount = bounty.amount;
        uint256 fee = totalAmount * 10 / 100; // 10% fee
        uint256 authorAmount = totalAmount - fee;

        // Reset the bounty
        delete questionBounties[questionId][msg.sender];

        // Transfer funds
        payable(msg.sender).transfer(authorAmount);
        payable(owner).transfer(fee); // Send fee to contract owner

        emit BountyClaimed(questionId, answerId, msg.sender, authorAmount);
    }

    function updateUserPoints(address user, uint256 points) internal {
        users[user].points += points;
    }

    function updateQuestionViews(uint256 questionId) public questionExists(questionId) {
        questions[questionId].views++;
    }

    function updateAnswerViews(uint256 answerId) public answerExists(answerId) {
        answers[answerId].views++;
    }

    function getQuestionAnswers(uint256 questionId) public view returns (uint256[] memory) {
        return questionAnswers[questionId];
    }

    function getAllQuestions() public view returns (Question[] memory) {
        Question[] memory allQuestions = new Question[](questionCount);
        for (uint256 i = 1; i <= questionCount; i++) {
            allQuestions[i-1] = questions[i];
        }
        return allQuestions;
    }
}