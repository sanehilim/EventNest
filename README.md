# EventNest - Decentralized Event Ticketing Platform

**Live Demo**: [https://eventnestty.vercel.app/](https://evnetetst.vercel.app/) 🚀

A Web3-powered event ticketing platform built on **Polygon Mainnet** that uses NFT tickets, accepts **any cryptocurrency via SideShift AI**, and eliminates ticket fraud through blockchain verification.

---

## 🎯 What is EventNest?

EventNest is a **decentralized event management platform** that revolutionizes how events are created, discovered, and attended:

- **For Event Creators**: Create public/private events with NFT-based tickets, set pricing, manage capacity, and track attendance—all on-chain
- **For Attendees**: Discover events, pay with **any cryptocurrency** (BTC, ETH, SOL, USDC, etc.), and receive blockchain-verified NFT tickets that can't be faked or duplicated
- **For Everyone**: Transparent, fraud-proof, and decentralized—no middlemen, no hidden fees, full ownership

---


## Update in wave 5
**NFT Ticket QR Check-In**
Tech: ERC-721, QR Code, Next.js API, Smart Contract validation

**Multi-Crypto Ticket Payments**
Tech: SideShift API, Polygon, Ethers.js, Wagmi

**Fraud-Proof Ticket Verification**
Tech: Blockchain ownership check, On-chain validation

**Ticket Resale with Royalties**
Tech: ERC-721 + ERC-2981, Marketplace Smart Contract

**Organizer Analytics Dashboard**
Tech: MongoDB, Aggregation, Chart.js, Next.js

**AI Event Discovery & Search**
Tech: Google Gemini AI, Semantic Search, Next.js API

## Update in wave 6 — Polygon Mainnet Deployment
**Mainnet Deployment**
- Smart contract deployed to Polygon Mainnet (Chain ID: 137)
- Contract Address: `0x5B2c51753B6367d19cd3D43420eDF5777E39fd85`
- Wagmi/Web3 config switched from Polygon Amoy to Polygon mainnet
- All API routes updated to use `POLYGON_MAINNET_RPC`
- Purchase flow fixed: walletAddress, transactionHash, tokenId, shiftId sent to purchase API
- createEvent now includes royaltyBps (2.5% default)
- Env vars aligned: PINATA_SECRET_API_KEY fallback, NEXT_PUBLIC_POLYGON_RPC

## 🌟 Key Features

### 🎟️ NFT Ticketing
- Every ticket is an **ERC-721 NFT** minted on Polygon Mainnet
- **Fraud-proof**: Blockchain verification ensures no fake/duplicate tickets
- **Transferable**: Send tickets to friends or resell them
- **Collectible**: Keep as digital memorabilia in your wallet

### 💰 Multi-Crypto Payments via SideShift
- **Pay with ANY cryptocurrency** (50+ supported): Bitcoin, Ethereum, Solana, USDC, USDT, BNB, etc.
- **Auto-conversion**: SideShift converts your crypto to MATIC for on-chain minting
- **No KYC required**: Simple, frictionless payment flow
- **Real-time quotes**: Get instant conversion rates

### 🔒 Public & Private Events
- **Public Events**: Open to everyone, discoverable on Explore page
- **Private Events**: Invite-only with PIN protection
- **PIN Verification**: Enter PIN to unlock private event details

### 🤖 AI-Powered Search
- **Natural language search** using Google Gemini AI
- Query: "Tech events this weekend in San Francisco"
- Semantic understanding of dates, locations, categories

### 📊 User Dashboard
- View **owned NFT tickets** (past & upcoming events)
- Manage **created events** (edit, view attendees)
- Track ticket sales and revenue

### ☁️ Decentralized Storage (IPFS)
- Event images & metadata stored on **Pinata IPFS**
- Permanent, censorship-resistant storage
- No centralized server dependencies

### ⚡ Low Transaction Fees
- Built on **Polygon Mainnet**
- ~$0.01 per transaction
- Fast confirmation times (2-5 seconds)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Blockchain** | Polygon Mainnet (ERC-721 NFTs) |
| **Smart Contract** | Solidity, Hardhat, OpenZeppelin |
| **Payment Gateway** | SideShift AI API (multi-crypto) |
| **Decentralized Storage** | Pinata IPFS |
| **Database** | MongoDB (event metadata, user profiles) |
| **AI Search** | Google Gemini API (natural language) |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS 4, Framer Motion (animations) |
| **Web3 Integration** | Wagmi, WalletConnect, Ethers.js |
| **Wallet Support** | MetaMask, WalletConnect, Coinbase Wallet |

---

## 📱 How It Works

### For Event Creators:
1. **Connect Wallet** → MetaMask or WalletConnect
2. **Create Event** → Fill in title, date, location, ticket price, capacity
3. **Upload Banner** → Image stored on IPFS via Pinata
4. **Set Visibility** → Public (open) or Private (PIN-protected)
5. **Deploy On-Chain** → Event metadata saved to MongoDB, ready for ticket sales

### For Event Attendees:
1. **Browse Events** → Explore page or AI search ("Music events near me")
2. **Select Event** → View details, date, location, pricing
3. **Choose Payment** → Pay with BTC, ETH, SOL, or any supported crypto
4. **SideShift Magic** → Crypto converted to MATIC, NFT minted automatically
5. **Receive NFT** → Ticket appears in your wallet & Dashboard
6. **Attend Event** → Show NFT at entrance (QR code/wallet verification)

---

## 💳 SideShift API Integration

### What is SideShift?
[SideShift.ai](https://sideshift.ai) is a **non-custodial crypto exchange** that enables instant, KYC-free conversions between 50+ cryptocurrencies.

### How EventNest Uses SideShift:
1. **User selects cryptocurrency** (e.g., Bitcoin) to pay for a 0.05 MATIC ticket
2. **Get Quote** → App calls `/api/sideshift/quote` with:
   ```json
   {
     "fromCurrency": "btc",
     "toCurrency": "matic",
     "toAmount": "0.05"
   }
   ```
3. **Display Quote** → Shows user exact BTC amount needed (e.g., 0.00012 BTC)
4. **Create Shift** → User confirms, app calls `/api/sideshift/shift` to generate deposit address
5. **User Sends Crypto** → User sends BTC to provided address
6. **SideShift Converts** → BTC → MATIC automatically
7. **NFT Minted** → Once MATIC received, smart contract mints NFT ticket
8. **Ticket Delivered** → NFT appears in user's wallet

### API Endpoints Used:
- **Quote**: `GET https://sideshift.ai/api/v2/quotes` - Get conversion rates
- **Create Shift**: `POST https://sideshift.ai/api/v2/shifts` - Initiate payment
- **Check Status**: `GET https://sideshift.ai/api/v2/shifts/:id` - Track payment

### Benefits:
- ✅ Accept 50+ cryptocurrencies (BTC, ETH, SOL, USDC, DOGE, etc.)
- ✅ No KYC/account required
- ✅ Non-custodial (users control funds)
- ✅ Fast conversions (5-15 minutes)
- ✅ Built-in affiliate program support

---

## 🗂️ Project Structure

```
eventnest/
├── contracts/               # Solidity smart contracts
│   └── EventTicketNFT.sol  # ERC-721 NFT ticket contract
├── scripts/                 # Deployment scripts
│   └── deploy.js           # Hardhat deploy to Polygon Amoy
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page (hero, features)
│   │   ├── explore/        # Event discovery (grid, AI search)
│   │   ├── create-event/   # Event creation form
│   │   ├── event/[id]/     # Event detail page (buy tickets)
│   │   ├── dashboard/      # User dashboard (my tickets, my events)
│   │   └── api/            # API routes (Next.js server)
│   │       ├── events/     # CRUD operations for events
│   │       ├── upload/     # IPFS upload via Pinata
│   │       ├── search/     # AI search with Gemini
│   │       ├── sideshift/  # SideShift quote & shift creation
│   │       └── user/       # User profile & tickets
│   ├── components/
│   │   ├── Navbar.tsx      # Header with wallet connect
│   │   ├── Web3Provider.tsx # Wagmi + WalletConnect setup
│   │   └── ui/             # Shadcn UI components
│   ├── lib/
│   │   ├── contractABI.ts  # Smart contract ABI & address
│   │   ├── mongodb.ts      # MongoDB connection
│   │   ├── pinata.ts       # IPFS file upload
│   │   ├── sideshift.ts    # SideShift API wrapper
│   │   ├── gemini.ts       # Google Gemini AI search
│   │   └── web3config.ts   # Wagmi configuration
│   └── hooks/              # Custom React hooks (useEvents, etc.)
├── .env                     # Environment variables (see below)
├── hardhat.config.js       # Hardhat config (Polygon Amoy)
├── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- MetaMask wallet
- MongoDB account (Atlas free tier)
- Alchemy/Infura account (Polygon RPC)
- WalletConnect Project ID
- Pinata API keys
- Google Gemini API key
- SideShift Affiliate ID (optional)

### 1. Clone Repository
```bash
git clone <repo-url>
cd eventnest
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Variables
Create `.env` file:
```env
# Blockchain (Polygon Mainnet)
PRIVATE_KEY=0x...                              # Wallet private key (for deployment)
POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_POLYGON_MAINNET_RPC=...            # Same RPC for frontend
NEXT_PUBLIC_POLYGON_RPC=...                    # Alias for deployment guide compatibility
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...             # Deployed contract address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...       # From cloud.walletconnect.com
NEXT_PUBLIC_WC_PROJECT_ID=...                  # Same as above

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...

# IPFS Storage (Pinata accepts PINATA_SECRET_KEY or PINATA_SECRET_API_KEY)
PINATA_API_KEY=...                             # From pinata.cloud
PINATA_SECRET_API_KEY=...                      # Or PINATA_SECRET_KEY

# AI Search
GEMINI_API_KEY=...                             # From makersuite.google.com/app/apikey

# Payment Processing (SideShift)
SIDESHIFT_SECRET=...                           # API secret (optional)
SIDESHIFT_AFFILIATE_ID=...                     # Your affiliate ID (optional)
SIDESHIFT_API=https://sideshift.ai/api/v2     # Base URL
```

### 4. Deploy Smart Contract
```bash
npm run deploy:mainnet
```
Copy contract address to `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS` and `src/lib/contractABI.ts`

### 5. Run Development Server
```bash
npm run dev
# App runs at http://localhost:3000
```

---

## 🔐 Smart Contract Details

**Contract Address**: `0x5B2c51753B6367d19cd3D43420eDF5777E39fd85` (Polygon Mainnet)

### Key Functions:
```solidity
// Mint NFT ticket (payable)
function mintTicket(
    address to,
    string memory eventId,
    string memory tokenURI
) public payable returns (uint256)

// Create new event
function createEvent(
    string memory eventId,
    uint256 maxSupply,
    uint256 ticketPrice,
    string memory metadataURI
) public

// Get ticket info
function ticketInfo(uint256 tokenId) 
    public view returns (
        string memory eventId,
        address attendee,
        uint256 mintedAt
    )
```

---

## 🗄️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | List all public events |
| `/api/events` | POST | Create new event |
| `/api/events/[id]` | GET | Get event details |
| `/api/events/[id]/purchase` | POST | Purchase ticket (updates DB) |
| `/api/events/[id]/verify-pin` | POST | Verify private event PIN |
| `/api/search?q=query` | GET | AI-powered event search |
| `/api/upload` | POST | Upload image/metadata to IPFS |
| `/api/user?address=0x...` | GET | Get user profile & tickets |
| `/api/sideshift/quote` | POST | Get crypto conversion quote |
| `/api/sideshift/shift` | POST | Execute crypto payment shift |

---

## 🎨 Design & UX

### Visual Theme
- **Color Palette**: Warm orange/yellow gradients (#FF6B35, #F7931E)
- **Typography**: Inter (body), Space Grotesk (headings)
- **Animations**: Framer Motion (page transitions, hover effects)
- **Backgrounds**: Layered CSS gradients, geometric patterns

### Responsive Design
- Mobile-first approach (Tailwind breakpoints)
- Optimized for 320px - 1920px widths
- Touch-friendly buttons (min 44px targets)

### Loading States
- Skeleton loaders for events
- Spinner for blockchain transactions
- Toast notifications for user feedback

---

## 🧪 Testing

### Run Linter
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

### Test Smart Contract
```bash
npx hardhat test
```

### Test API Endpoints
```bash
# List events
curl http://localhost:3000/api/events

# AI search
curl http://localhost:3000/api/search?q=music+events

# SideShift quote
curl -X POST http://localhost:3000/api/sideshift/quote \
  -H "Content-Type: application/json" \
  -d '{"fromCurrency":"btc","toCurrency":"matic","toAmount":"0.05"}'
```

---

## 🌍 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```
**Live URL**:https://eventnestty.vercel.app/

### Smart Contract (Polygon Mainnet)
1. Fund deployer wallet with ~0.5+ MATIC for gas
2. Run: `npm run deploy:mainnet`
3. Add `NEXT_PUBLIC_CONTRACT_ADDRESS` to `.env` and Vercel
4. Verify on Polygonscan: `npx hardhat verify --network polygon CONTRACT_ADDRESS`

### Environment Variables (Vercel)
Add all `.env` variables to Vercel dashboard under **Settings → Environment Variables**

---

## 📊 Database Schema (MongoDB)

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: String,
  category: String,              // "Music", "Tech", "Sports", etc.
  ticketPrice: Number,           // In MATIC
  availableTickets: Number,
  totalTickets: Number,
  imageUrl: String,              // IPFS URL
  isPrivate: Boolean,
  pin: String,                   // Hashed with bcrypt
  creatorAddress: String,        // Wallet address
  eventId: String,               // Blockchain event ID
  createdAt: Date,
  attendees: [String]            // Array of buyer addresses
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  address: String,               // Wallet address (unique)
  createdEvents: [ObjectId],     // Event IDs created
  purchasedTickets: [ObjectId],  // Event IDs attended
  nftTickets: [Number],          // NFT token IDs
  createdAt: Date
}
```

---

## 🚧 Known Issues & Limitations

### Current (Testnet) Limitations:
- **Polygon Amoy**: Testnet only (use faucet for test MATIC)
- **SideShift Test Mode**: Limited to testnet tokens
- **AI Search**: Basic semantic search (can be improved)

### Security Considerations:
- **Private Keys**: Never commit `.env` to GitHub
- **PIN Storage**: Hashed with bcrypt (not plaintext)
- **Smart Contract**: Not audited (use at own risk)

---

## 🔮 Future Roadmap

- [ ] **Ticket Resale Marketplace** - Secondary market for NFT tickets
- [ ] **Refund System** - Time-based cancellation & refunds
- [ ] **QR Code Check-In** - Mobile app for event entry
- [ ] **Analytics Dashboard** - Revenue tracking, attendee insights
- [ ] **DAO Governance** - Token holders vote on platform decisions
- [ ] **Loyalty NFTs** - Reward badges for frequent attendees
- [ ] **Multi-Chain Support** - Expand to Ethereum, Arbitrum, Optimism
- [ ] **Social Features** - Follow creators, event recommendations
- [ ] **WhiteLabel Solution** - Let others deploy their own instance

---
 
---
 

## 🙏 Acknowledgements

- **Polygon** - For fast, low-cost blockchain infrastructure
- **SideShift.ai** - For enabling multi-crypto payments without KYC
- **Pinata** - For reliable IPFS storage
- **Google Gemini** - For AI-powered search
- **WalletConnect** - For seamless wallet integration
- **Shadcn UI** - For beautiful, accessible components
- **Hardhat** - For smart contract development tools

---

 

## 🎯 Key Takeaways

### What Makes EventNest Unique?
1. **Truly Multi-Crypto**: Pay with BTC, ETH, SOL, or 50+ tokens via SideShift
2. **Zero Fraud**: Blockchain verification eliminates fake tickets
3. **Decentralized**: No single point of failure (IPFS + blockchain)
4. **Low Fees**: Polygon makes NFT minting affordable (~$0.01)
5. **User-Friendly**: Web3 UX without sacrificing simplicity

### Production-Ready Checklist
- [x] Smart contract deployed to Polygon Mainnet
- [x] Frontend deployed to Vercel
- [x] MongoDB connected
- [x] IPFS storage configured
- [x] SideShift API integrated
- [x] AI search implemented
- [ ] Smart contract audit (recommended)
- [ ] Mobile app (future)

---

**Built with ❤️ for Web3 | Powered by Polygon, SideShift & IPFS**

🌐 **Live Demo**:https://eventnestty.vercel.app/
