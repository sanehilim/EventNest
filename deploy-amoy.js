import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "POL\n");

  if (balance === 0n) {
    throw new Error("Insufficient balance! Get testnet POL from https://faucet.polygon.technology/");
  }

  console.log("⚙️  Deploying EventTicketNFT contract...");
  const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
  const eventTicketNFT = await EventTicketNFT.deploy();
  
  console.log("⏳ Waiting for deployment confirmation...");
  await eventTicketNFT.waitForDeployment();

  const contractAddress = await eventTicketNFT.getAddress();
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network: Polygon Amoy Testnet (Chain ID: 80002)");
  console.log("👤 Deployer:", deployer.address);
  console.log("🔗 View on Explorer:");
  console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("=".repeat(60) + "\n");

  console.log("📝 Next steps:");
  console.log(`1. Update CONTRACT_ADDRESS in src/lib/contractABI.ts to: ${contractAddress}`);
  console.log(`2. Add to .env: NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`3. Verify contract: npx hardhat verify --network amoy ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
