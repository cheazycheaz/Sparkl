const QuestionAnswer = artifacts.require("QuestionAnswer");

contract("QuestionAnswer", (accounts) => {
  it("should post a question", async () => {
    const instance = await QuestionAnswer.deployed();
    await instance.postQuestion("Test question", "Test details", "ipfs_hash");
    const questionCount = await instance.questionCount();
    assert.equal(questionCount, 1, "Question count should be 1");
  });

  // Add more tests...
});