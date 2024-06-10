// SPDX-License-Identifier: MIT

/* This smart contract provides the basic functionality for storing and retrieving 
question and answer metadata on the Base blockchain. The actual content (text, images, etc.)
associated with the questions and answers are stored on Banyan, and this contract just stores
the Banyan file IDs as references.
*/

pragma solidity ^0.8.3;

contract QuestionAnswer {
    struct Question {
        string banyanFileId;
        uint256 timestamp;
        uint256 answerCount;
    }

    struct Answer {
        string banyanFileId;
        uint256 timestamp;
        address author;
    }

    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(uint256 => Answer)) public answers;
    uint256 public questionCount;

    event QuestionAdded(uint256 indexed questionId, string banyanFileId, uint256 timestamp);
    event AnswerAdded(uint256 indexed questionId, uint256 indexed answerId, string banyanFileId, uint256 timestamp, address author);

    function addQuestion(string memory _banyanFileId) public {
        questions[questionCount] = Question(_banyanFileId, block.timestamp, 0);
        emit QuestionAdded(questionCount, _banyanFileId, block.timestamp);
        questionCount++;
    }

    function addAnswer(uint256 _questionId, string memory _banyanFileId) public {
        require(_questionId < questionCount, "Invalid question ID");

        Answer memory newAnswer = Answer(_banyanFileId, block.timestamp, msg.sender);
        answers[_questionId][questions[_questionId].answerCount] = newAnswer;
        questions[_questionId].answerCount++;

        emit AnswerAdded(_questionId, questions[_questionId].answerCount - 1, _banyanFileId, block.timestamp, msg.sender);
    }

    
/* To retrieve a question/answer */

    function getQuestion(uint256 _questionId) public view returns (string memory, uint256, uint256) {
        require(_questionId < questionCount, "Invalid question ID");

        Question memory question = questions[_questionId];
        return (question.banyanFileId, question.timestamp, question.answerCount);
    }

    function getAnswer(uint256 _questionId, uint256 _answerId) public view returns (string memory, uint256, address) {
        require(_questionId < questionCount, "Invalid question ID");
        require(_answerId < questions[_questionId].answerCount, "Invalid answer ID");

        Answer memory answer = answers[_questionId][_answerId];
        return (answer.banyanFileId, answer.timestamp, answer.author);
    }
}