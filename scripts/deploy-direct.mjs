import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const EVENTTICKET_ABI = JSON.parse(await fs.readFile('./artifacts/contracts/EventTicketNFT.sol/EventTicketNFT.json', 'utf8')).abi;
const EVENTTICKET_BYTECODE = JSON.parse(await fs.readFile('./artifacts/contracts/EventTicketNFT.sol/EventTicketNFT.json', 'utf8')).bytecode;

async function main() {
  console.log("🚀 Deploying EventTicketNFT to Polygon Amoy Testnet\n");

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📝 Deployer address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "POL\n");

  if (balance === 0n) {
    console.error("❌ No balance! Get testnet POL from https://faucet.polygon.technology/");
    process.exit(1);
  }

  console.log("⚙️  Deploying contract...");
  const factory = new ethers.ContractFactory(EVENTTICKET_ABI, EVENTTICKET_BYTECODE, wallet);
  const contract = await factory.deploy();
  
  console.log("⏳ Waiting for confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n" + "=".repeat(70));
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(70));
  console.log("📍 Contract Address:", address);
  console.log("🌐 Network: Polygon Amoy Testnet (Chain ID: 80002)");
  console.log("👤 Deployer:", wallet.address);
  console.log("🔗 Explorer:");
  console.log(`   https://amoy.polygonscan.com/address/${address}`);
  console.log("=".repeat(70) + "\n");

  console.log("📝 Update the following:");
  console.log(`   CONTRACT_ADDRESS in src/lib/contractABI.ts: "${address}"`);
  console.log(`   Add to .env: NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exit(1);
});
