import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Read the Solidity contract
const contractSource = readFileSync('./contracts/EventTicketNFT.sol', 'utf8');

async function main() {
  console.log("🚀 Deploying EventTicketNFT to Polygon Amoy Testnet\n");

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📝 Deployer address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "POL");

  if (balance === 0n) {
    console.error("\n❌ No balance! Visit: https://faucet.polygon.technology/");
    console.error("   Send testnet POL to:", wallet.address);
    process.exit(1);
  }

  // Get the network
  const network = await provider.getNetwork();
  console.log("🌐 Network:", network.name, "- Chain ID:", network.chainId.toString());
  
  if (network.chainId !== 80002n) {
    console.error("\n❌ Wrong network! Expected Polygon Amoy (80002)");
    process.exit(1);
  }

  console.log("\n⚙️  To deploy, we need compiled bytecode.");
  console.log("📋 Please compile the contract first with:");
  console.log("   npx hardhat compile --force\n");
  console.log("✅ Contract source loaded from: contracts/EventTicketNFT.sol");
  console.log("📊 Contract size:", (contractSource.length / 1024).toFixed(2), "KB\n");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
