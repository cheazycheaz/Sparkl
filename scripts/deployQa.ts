import { ethers } from 'hardhat';

async function main() {
  const qa = await ethers.deployContract('QuestionAnswer');

  await qa.waitForDeployment();

  console.log('NFT Contract Deployed at ' + qa.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});