const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  const Contract = await hre.ethers.getContractFactory("EventTicketNFT");
  const contract = await Contract.deploy();
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
