# Quick Start Guide - Week 4 Backend

## ✅ Fixed Issues

1. **Deploy Script**: Fixed ABI extraction to work with ethers v6 by reading from artifacts
2. **Hardhat Node**: Verified command works correctly
3. **Deploy Command**: Verified deployment works correctly

## 🚀 How to Use the Commands

### Step 1: Start Hardhat Node

Open a terminal in the `BharatVote-Week4-Backend` directory and run:

```bash
# Option 1: Using npx (recommended)
npx hardhat node

# Option 2: Using npm script
npm run node
```

**⚠️ Important:** Use `npx hardhat node` or `npm run node` (NOT `npm hardhat node`)

This will start a local blockchain node on `http://127.0.0.1:8545`. **Keep this terminal open** - the node needs to keep running.

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

### Step 2: Deploy the Contract

Open a **new terminal** (keep the first one running) in the `BharatVote-Week4-Backend` directory and run:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

This will:
- Deploy the BharatVote contract to the local node
- Set the Merkle root from `eligibleVoters.json`
- Add 4 sample candidates
- Export the contract ABI and address to the frontend

You should see output like:
```
🚀 Starting BharatVote (Week 4) deployment...
✅ Contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Merkle root set on contract
✅ Added 4 sample candidates
✅ DEPLOYMENT COMPLETE (WEEK 4)
```

### Alternative: Using npm scripts

You can also use the npm scripts defined in `package.json`:

```bash
# Terminal 1: Start node
npm run node

# Terminal 2: Deploy
npm run deploy
```

## 📝 Important Notes

1. **Two Terminals Required**: You need to run `npx hardhat node` in one terminal and keep it running, then run the deploy command in a separate terminal.

2. **Network Configuration**: The deploy script is configured to use the `localhost` network (chain ID 31337) which matches the default Hardhat node.

3. **Frontend Integration**: After deployment, the contract address and ABI are automatically saved to `BharatVote-Week4-Frontend/src/contracts/BharatVote.json`.

4. **Eligible Voters**: The script reads from `eligibleVoters.json` in the root directory. Make sure this file exists with an array of eligible voter addresses.

## 🔧 Troubleshooting

### Error: "EADDRINUSE: address already in use 127.0.0.1:8545"

This means port 8545 is already in use (likely by another Hardhat node instance).

**Solution 1: Kill the process (Windows PowerShell)**
```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 8545 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Solution 2: Kill the process (Windows CMD)**
```cmd
# Find the process ID
netstat -ano | findstr :8545

# Kill it (replace PID with the actual process ID)
taskkill /F /PID <PID>
```

**Solution 3: Use the npm script (Easiest!)**
```bash
npm run kill-port
```

**Solution 4: Use the helper scripts directly**
```powershell
# PowerShell script
.\scripts\kill-port-8545.ps1

# Or batch file
scripts\kill-port-8545.bat
```

**Solution 5: Kill all Node processes (nuclear option)**
```cmd
taskkill /F /IM node.exe
```
⚠️ Warning: This will kill ALL Node.js processes, including other projects!

### Error: "Hardhat node is not running"
- Make sure you started `npx hardhat node` in a separate terminal
- Check that the node is running on port 8545

### Error: "Cannot find path"
- Make sure you're in the `BharatVote-Week4-Backend` directory
- Use `cd BharatVote-Week4-Backend` before running commands

### Error: "Contract not deployed"
- Make sure the hardhat node is still running
- Try redeploying with `npm run deploy`

## ✅ Verification

After successful deployment, you can verify by:

1. Check the frontend contract file exists:
   ```
   BharatVote-Week4-Frontend/src/contracts/BharatVote.json
   ```

2. Use Hardhat console to interact with the contract:
   ```bash
   npx hardhat console --network localhost
   ```

3. Run verification script:
   ```bash
   npm run verify
   ```

