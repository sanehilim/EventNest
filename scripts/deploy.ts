import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL");

  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
  console.log("Deploying EventTicketNFT...");

  const eventTicketNFT = await EventTicketNFT.deploy();
  await eventTicketNFT.waitForDeployment();

  const contractAddress = await eventTicketNFT.getAddress();
  console.log("EventTicketNFT deployed to:", contractAddress);

  console.log("\n===========================================");
  console.log("Deployment successful!");
  console.log("===========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Polygon Amoy Testnet");
  console.log("Deployer:", deployer.address);
  console.log("===========================================\n");

  console.log("Update the following files:");
  console.log("1. src/lib/contractABI.ts - Update CONTRACT_ADDRESS");
  console.log("2. .env - Add CONTRACT_ADDRESS=" + contractAddress);

  console.log("\nVerify contract with:");
  console.log(`npx hardhat verify --network amoy ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
