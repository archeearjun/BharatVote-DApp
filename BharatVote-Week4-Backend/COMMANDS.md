# Quick Command Reference

## 🚀 Starting Hardhat Node

**Correct commands:**
```bash
# Option 1: Using npx (recommended)
npx hardhat node

# Option 2: Using npm script
npm run node
```

**❌ Wrong command:**
```bash
npm hardhat node  # This will NOT work!
```

## 📦 Deploying Contract

**Correct commands:**
```bash
# Option 1: Using npx
npx hardhat run scripts/deploy.ts --network localhost

# Option 2: Using npm script
npm run deploy
```

## 🔧 Killing Port 8545

If you get "port already in use" error:

```bash
# Easiest method
npm run kill-port

# Or use PowerShell directly
powershell -ExecutionPolicy Bypass -File scripts/kill-port-8545.ps1

# Or use batch file
scripts\kill-port-8545.bat
```

## 📋 All Available Commands

```bash
# Compile contracts
npm run compile

# Start Hardhat node
npm run node

# Deploy contract
npm run deploy

# Verify deployment
npm run verify

# Test voting flow
npm run test-vote

# Check current phase
npm run check-phase

# Generate Merkle proofs
npm run generate-proof

# Kill port 8545
npm run kill-port

# Clean build artifacts
npm run clean
```

## 💡 Common Mistakes

1. **Wrong:** `npm hardhat node`  
   **Correct:** `npm run node` or `npx hardhat node`

2. **Wrong:** `npm deploy`  
   **Correct:** `npm run deploy` or `npx hardhat run scripts/deploy.ts --network localhost`

3. **Wrong:** `npx run script/deploy.ts`  
   **Correct:** `npx hardhat run scripts/deploy.ts --network localhost`  
   **Note:** Must use `hardhat run` (not just `run`) and `scripts/` (not `script/`)

4. **Forgetting to start node first:** Always run `npm run node` in one terminal before deploying in another terminal.

