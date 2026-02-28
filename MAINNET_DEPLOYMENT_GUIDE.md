# Mainnet Deployment Guide — Complete Checklist

A step-by-step guide for deploying blockchain + frontend projects to mainnet (Polygon, Ethereum, etc.). Use this for any similar project.

---

## 1. Smart Contract Deployment (Hardhat)

### 1.1 Hardhat Config (`hardhat.config.js`)

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,  // Polygon mainnet
    },
  },
  etherscan: {
    apiKey: { polygon: process.env.POLYGONSCAN_API_KEY || "" },
  },
};
```

**Checklist:**
- [ ] Add mainnet network (chainId: 137 for Polygon, 1 for Ethereum)
- [ ] Use RPC URL from Alchemy/Infura (free tier works)
- [ ] Never commit `PRIVATE_KEY` — use `.env` and add to `.gitignore`
- [ ] For PolygonScan verification, add `POLYGONSCAN_API_KEY`

### 1.2 Deploy Script

- Use **real token addresses** on mainnet (e.g. USDC: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` on Polygon)
- Do **not** deploy MockUSDC on mainnet
- Ensure deployer wallet has enough native token (MATIC/ETH) for gas

### 1.3 Before Deploying Contracts

- [ ] Run `npm run compile` — no errors
- [ ] Test on testnet first (Amoy/Sepolia)
- [ ] Verify `.env` has correct `PRIVATE_KEY` and `POLYGON_MAINNET_RPC`
- [ ] Check deployer balance: `~0.5 MATIC` minimum for Polygon

---

## 2. Environment Variables (`.env`)

### 2.1 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PRIVATE_KEY` | Deployer wallet (0x...) | `0xabc123...` |
| `POLYGON_MAINNET_RPC` | RPC URL | `https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract | `0x...` |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC on mainnet | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| `NEXT_PUBLIC_POLYGON_RPC` | Same RPC for frontend | Same as above |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `PINATA_API_KEY` | IPFS (if used) | From pinata.cloud |
| `PINATA_SECRET_KEY` | IPFS secret | From pinata.cloud |

### 2.2 Security Rules

- [ ] **Never** commit `.env` — ensure it's in `.gitignore`
- [ ] Use `NEXT_PUBLIC_` only for values that must be in the browser
- [ ] Keep `PRIVATE_KEY` server-side only (API routes, deploy scripts)
- [ ] For Vercel: add all vars in Project Settings → Environment Variables

---

## 3. Frontend Configuration

### 3.1 Package.json

**Move build-critical deps to `dependencies`** (not `devDependencies`) so Vercel installs them:

- `tailwindcss`, `postcss`, `autoprefixer` — CSS build
- `@types/crypto-js` — TypeScript (if you use crypto-js)
- `eslint`, `eslint-config-next`, `typescript` — if build runs lint/typecheck

**Avoid UTF-8 BOM** when editing `package.json` — it breaks JSON parsing. Use "Save without BOM" or plain UTF-8.

### 3.2 Next.js Config (`next.config.js`)

```javascript
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },  // Optional: skip ESLint if it fails
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }
    return config
  },
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_POLYGON_RPC: process.env.NEXT_PUBLIC_POLYGON_RPC,
  },
}
module.exports = nextConfig
```

**Checklist:**
- [ ] Add webpack fallbacks for optional deps (MetaMask SDK, pino-pretty) to avoid build warnings
- [ ] Pass env vars via `env` block so they're available at build time
- [ ] Use `eslint: { ignoreDuringBuilds: true }` only if ESLint blocks deployment

### 3.3 Wagmi/Web3 Providers

- Switch chain from testnet to mainnet: `polygon` instead of `polygonAmoy`
- Use mainnet RPC in `createConfig` transports
- Ensure contract addresses match mainnet deployment

### 3.4 TypeScript

- Add `declare module 'crypto-js'` (or similar) in `types/*.d.ts` if you get "Could not find declaration file"
- Ensure `tsconfig.json` includes `types/**/*.d.ts` or `**/*.ts`

---

## 4. Vercel Deployment

### 4.1 Project Structure (Monorepo with `frontend/`)

If your Next.js app is in a subfolder (e.g. `frontend/`):

**Option A — Root Directory in Dashboard**

1. Vercel Dashboard → Project → Settings → General
2. Set **Root Directory** to `frontend`
3. Leave **Build Command** and **Output Directory** as default

**Option B — Config in `vercel.json` (no Root Directory override)**

```json
{
  "framework": "nextjs",
  "installCommand": "cd frontend && npm install",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next"
}
```

Use this when Root Directory is `.` (repo root). The build runs from root but targets the frontend folder.

### 4.2 Vercel Environment Variables

Add in **Settings → Environment Variables** (for Production):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Your deployed contract |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC mainnet address |
| `NEXT_PUBLIC_POLYGON_RPC` | RPC URL |
| `PRIVATE_KEY` | For server-side blockchain calls |
| `MONGODB_URI` | Database |
| `PINATA_API_KEY` | If using IPFS |
| `PINATA_SECRET_KEY` | If using IPFS |

### 4.3 Common Vercel Errors & Fixes

| Error | Fix |
|-------|-----|
| "No Next.js version detected" | Set Root Directory to `frontend` or add `next` to root `package.json` |
| ".next was not found" | Add `outputDirectory: "frontend/.next"` or set Root Directory to `frontend` |
| "Cannot find module 'tailwindcss'" | Move `tailwindcss`, `postcss`, `autoprefixer` to `dependencies` |
| "ESLint must be installed" | Add `eslint: { ignoreDuringBuilds: true }` or move eslint to `dependencies` |
| "Could not find declaration file for 'crypto-js'" | Add `@types/crypto-js` to dependencies + `declare module 'crypto-js'` in types |
| "Unexpected token... is not valid JSON" | Remove UTF-8 BOM from `package.json` |

---

## 5. Pre-Deploy Checklist

### Smart Contracts
- [ ] Contracts compile without errors
- [ ] Mainnet network added to Hardhat config
- [ ] Deploy script uses mainnet token addresses (no mocks)
- [ ] Deployer has gas (MATIC/ETH)
- [ ] `.env` has `PRIVATE_KEY` and mainnet RPC

### Frontend
- [ ] `package.json` has no BOM, valid JSON
- [ ] Build-critical deps in `dependencies`
- [ ] `next.config.js` has webpack fallbacks if needed
- [ ] Chain set to mainnet in Wagmi/Web3 config
- [ ] Contract addresses updated after deployment

### Vercel
- [ ] `vercel.json` matches project structure (root vs `frontend/`)
- [ ] All env vars set in Vercel dashboard
- [ ] Root Directory correct (or `outputDirectory` set)
- [ ] Build succeeds locally: `cd frontend && npm run build`

### Security
- [ ] `.env` in `.gitignore`
- [ ] No private keys in frontend code
- [ ] API keys only in server-side env

---

## 6. Deployment Order

1. **Deploy contracts** → `npm run deploy:mainnet`
2. **Copy contract addresses** → Update `.env` and Vercel env vars
3. **Push to Git** → Trigger Vercel deploy (or deploy via CLI)
4. **Verify** → Check contract on PolygonScan, test app on live URL

---

## 7. Useful Commands

```bash
# Compile contracts
npm run compile

# Deploy to mainnet
npm run deploy:mainnet

# Test frontend build locally
cd frontend && npm install && npm run build

# Deploy to Vercel (if using CLI)
vercel --prod
```

---

## 8. Polygon Mainnet Reference

| Item | Value |
|------|-------|
| Chain ID | 137 |
| USDC (Native) | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| USDC.e (Bridged) | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| RPC | `https://polygon-rpc.com` or Alchemy/Infura |
| Explorer | https://polygonscan.com |

---

**Built from real deployment experience with PolyDropBox**
