const QuestionAnswer = artifacts.require("QuestionAnswer");

module.exports = function (deployer) {
  deployer.deploy(QuestionAnswer);
};