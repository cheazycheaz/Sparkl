const { ethers } = require("hardhat");

async function main() {
  const QuestionAnswer = await ethers.getContractFactory("QuestionAnswer");
  const questionAnswer = await QuestionAnswer.deploy();

  // Wait for the contract deployment transaction to be mined
  const deployTx = await questionAnswer.deployTransaction;
  if (deployTx) {
    const receipt = await deployTx.wait();
    if (receipt.status === 1) {
      console.log("QuestionAnswer contract deployed to:", questionAnswer.address);
    } else {
      console.error("Contract deployment failed");
    }
  } else {
    console.error("Contract deployment failed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });