import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import solc from 'solc';
import { readFileSync } from 'fs';

dotenv.config();

async function main() {
  console.log("🚀 Deploying EventTicketNFT to Polygon Amoy\n");

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📝 Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "POL\n");

  if (balance === 0n) {
    console.error("❌ Get testnet POL from: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Read contract
  const contractSource = readFileSync('./contracts/EventTicketNFT.sol', 'utf8');
  
  // Read OpenZeppelin dependencies
  const erc721Source = readFileSync('./node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol', 'utf8');
  const erc721URISource = readFileSync('./node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol', 'utf8');
  const ierc721Source = readFileSync('./node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol', 'utf8');
  const ierc721ReceiverSource = readFileSync('./node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol', 'utf8');
  const ierc721MetadataSource = readFileSync('./node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol', 'utf8');
  const ierc165Source = readFileSync('./node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol', 'utf8');
  const erc165Source = readFileSync('./node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol', 'utf8');
  const contextSource = readFileSync('./node_modules/@openzeppelin/contracts/utils/Context.sol', 'utf8');
  const stringsSource = readFileSync('./node_modules/@openzeppelin/contracts/utils/Strings.sol', 'utf8');
  const mathSource = readFileSync('./node_modules/@openzeppelin/contracts/utils/math/Math.sol', 'utf8');
  const signedMathSource = readFileSync('./node_modules/@openzeppelin/contracts/utils/math/SignedMath.sol', 'utf8');
  const errorsSource = readFileSync('./node_modules/@openzeppelin/contracts/interfaces/draft-IERC6093.sol', 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'EventTicketNFT.sol': { content: contractSource },
      '@openzeppelin/contracts/token/ERC721/ERC721.sol': { content: erc721Source },
      '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol': { content: erc721URISource },
      '@openzeppelin/contracts/token/ERC721/IERC721.sol': { content: ierc721Source },
      '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol': { content: ierc721ReceiverSource },
      '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol': { content: ierc721MetadataSource },
      '@openzeppelin/contracts/utils/introspection/IERC165.sol': { content: ierc165Source },
      '@openzeppelin/contracts/utils/introspection/ERC165.sol': { content: erc165Source },
      '@openzeppelin/contracts/utils/Context.sol': { content: contextSource },
      '@openzeppelin/contracts/utils/Strings.sol': { content: stringsSource },
      '@openzeppelin/contracts/utils/math/Math.sol': { content: mathSource },
      '@openzeppelin/contracts/utils/math/SignedMath.sol': { content: signedMathSource },
      '@openzeppelin/contracts/interfaces/draft-IERC6093.sol': { content: errorsSource }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode'] }
      }
    }
  };

  console.log("⚙️  Compiling contract...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach(e => console.error(e.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts['EventTicketNFT.sol']['EventTicketNFT'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log("✅ Compiled successfully");
  console.log("📦 Deploying...\n");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployedContract = await factory.deploy();
  
  console.log("⏳ Waiting for confirmation...");
  await deployedContract.waitForDeployment();

  const address = await deployedContract.getAddress();

  console.log("\n" + "=".repeat(70));
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(70));
  console.log("📍 Contract Address:", address);
  console.log("🌐 Network: Polygon Amoy (Chain ID: 80002)");
  console.log("👤 Deployer:", wallet.address);
  console.log("🔗 View: https://amoy.polygonscan.com/address/" + address);
  console.log("=".repeat(70) + "\n");

  console.log("✏️  Update CONTRACT_ADDRESS in src/lib/contractABI.ts:");
  console.log(`   export const CONTRACT_ADDRESS = '${address}';\n`);
}

main().catch(console.error);
