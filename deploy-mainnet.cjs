const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment to Polygon Mainnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "POL\n");

  if (balance === 0n) {
    throw new Error("Insufficient balance! Fund your wallet with MATIC for gas.");
  }

  console.log("Deploying EventTicketNFT contract...");
  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
  const eventTicketNFT = await EventTicketNFT.deploy();
  
  console.log("Waiting for deployment confirmation...");
  await eventTicketNFT.waitForDeployment();

  const contractAddress = await eventTicketNFT.getAddress();
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Network: Polygon Mainnet (Chain ID: 137)");
  console.log("Deployer:", deployer.address);
  console.log("View on Explorer:");
  console.log(`   https://polygonscan.com/address/${contractAddress}`);
  console.log("=".repeat(60) + "\n");

  console.log("Next steps:");
  console.log(`1. Update .env: NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`2. Update CONTRACT_ADDRESS in src/lib/contractABI.ts`);
  console.log(`3. Verify: npx hardhat verify --network polygon ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDeployment failed:", error.message);
    process.exit(1);
  });
