# BharatVote Demo Setup Guide 🚀

This guide will help you deploy BharatVote to public networks for demos while keeping your local development environment intact.

## 🎯 Demo Options

### Option 1: Sepolia Testnet (Recommended)
- **Cost**: Free (get test ETH from faucets)
- **Speed**: Fast (15-30 second block time)
- **Audience**: Anyone with MetaMask
- **Risk**: None (testnet)

### Option 2: Mumbai Testnet (Polygon)
- **Cost**: Free (get test MATIC from faucets)
- **Speed**: Very Fast (2-3 second block time)
- **Audience**: Anyone with MetaMask
- **Risk**: None (testnet)

### Option 3: Mainnet (Advanced)
- **Cost**: Real ETH (be very careful!)
- **Speed**: 12-15 second block time
- **Audience**: Anyone with MetaMask
- **Risk**: High (real money)

## 🛠️ Setup Steps

### Step 1: Get Testnet ETH

#### Sepolia Testnet
1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request test ETH (you'll get 0.5 ETH)

#### Mumbai Testnet
1. Go to [Mumbai Faucet](https://faucet.polygon.technology/)
2. Connect your MetaMask wallet
3. Request test MATIC (you'll get 0.1 MATIC)

### Step 2: Configure Environment

1. Copy `frontend/env.example` to `frontend/.env.local`
2. Update with your network details:

```bash
# For Sepolia Demo
VITE_ENV=demo
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Backend (Render) for Public Demo "Stranger Mode"
# Required for `/api/join` auto-funding + Merkle proof service.
# Configure these on your backend host (Render) and point the frontend at it.
VITE_BACKEND_URL=https://bharatvote-backend.onrender.com

# For Mumbai Demo
VITE_ENV=demo
VITE_CHAIN_ID=80001
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
```

Backend host env vars (Render):

```bash
# Used to fund strangers + sync demo eligibility on-chain
PRIVATE_KEY=0x...
VITE_SEPOLIA_RPC_URL=https://...
VITE_DEMO_ELECTION_ADDRESS=0x...
```

### Step 3: Deploy to Testnet

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy-demo.ts --network sepolia

# Deploy to Mumbai
npx hardhat run scripts/deploy-demo.ts --network mumbai
```

### Step 4: Update Frontend

The deployment script automatically updates your frontend contract address. If you need to do it manually:

1. Copy the deployed contract address from the deployment output
2. Update `frontend/src/contracts/BharatVote.json`
3. Update your environment variables

### Step 5: Deploy Frontend

```bash
# Build for production
cd frontend
npm run build

# Deploy to your hosting service (Vercel, Netlify, etc.)
# Or serve locally with a public URL using ngrok
npx serve -s dist -l 3000
```

## 🌐 Public Demo Setup

### Using ngrok for Local Demo

```bash
# Install ngrok
npm install -g ngrok

# Start your frontend
cd frontend
npm run dev

# In another terminal, expose your local server
ngrok http 3000
```

This will give you a public URL like `https://abc123.ngrok.io` that you can share with your audience.

### Using Vercel for Production Demo

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts to deploy
```

## 📱 Demo Instructions for Audience

Share these instructions with your demo audience:

### 1. Install MetaMask
- Download from [metamask.io](https://metamask.io/)
- Create a new wallet or import existing

### 2. Add Testnet Network
- Open MetaMask
- Click network dropdown
- Select "Add Network"
- Add the testnet details:

**Sepolia:**
- Network Name: Sepolia Testnet
- RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Chain ID: 11155111
- Currency Symbol: ETH

**Mumbai:**
- Network Name: Mumbai Testnet
- RPC URL: https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
- Chain ID: 80001
- Currency Symbol: MATIC

### 3. Get Test Tokens
- Visit the appropriate faucet
- Request test tokens
- Wait for confirmation

### 4. Connect to Your Demo
- Visit your demo URL
- Connect MetaMask wallet
- Make sure you're on the correct network
- Start voting!

## 🔧 Troubleshooting

### Common Issues

1. **"Wrong Network" Error**
   - Make sure audience is connected to the correct testnet
   - Use the NetworkSwitcher component to help them switch

2. **"Insufficient Balance" Error**
   - Direct them to the appropriate faucet
   - Wait for test tokens to arrive

3. **Contract Not Found**
   - Verify the contract address is correct
   - Check if the contract was deployed successfully

4. **Vercel build fails with `ENOENT ... /.pnpm-store/...`**
   - This is a pnpm cache/store corruption from Vercel’s restored build cache.
   - This repo sets pnpm’s store to `/tmp/pnpm-store` via `.npmrc` to avoid reusing a bad cached store.
   - If it still happens, clear the Vercel build cache once and redeploy.

5. **Transaction Stuck**
   - Check network congestion
   - Suggest increasing gas limit
   - Wait for confirmation

### Debug Commands

```bash
# Check contract on testnet
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Check contract balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Reset local network
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

## 🎉 Demo Best Practices

1. **Prepare Your Demo**
   - Deploy contract with pre-populated candidates
   - Set up some initial votes
   - Test the complete flow

2. **During Demo**
   - Show the contract on blockchain explorer
   - Demonstrate real-time voting
   - Show transaction confirmations
   - Explain the security features

3. **Post-Demo**
   - Share the contract address
   - Provide setup instructions
   - Answer questions about the technology

## 🔒 Security Notes

- **Never** deploy to mainnet with real ETH unless you're absolutely sure
- **Always** test on testnets first
- **Keep** your private keys secure
- **Use** environment variables for sensitive data
- **Monitor** your demo contracts for unusual activity

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify network configuration
3. Ensure sufficient test tokens
4. Check contract deployment status

Happy demoing! 🎊

