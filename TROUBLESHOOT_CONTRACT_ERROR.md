# Troubleshooting "Contract call failed" Error

## Quick Diagnostic Steps

### Step 1: Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab. Look for:
- `DEBUG: Contract code at address: ...`
- `DEBUG: Contract exists: true/false`
- `DEBUG: Contract is accessible, candidate count: ...`
- Any error messages

### Step 2: Verify Services Are Running

**Check Terminal 1 - Hardhat Node:**
```bash
# Should show: "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
# If not running, start it:
cd BharatVote-Week9-Backend
npm run node
```

**Check Terminal 2 - Backend Server:**
```bash
# Should show: "Backend server listening at http://localhost:3001"
# If not running, start it:
cd BharatVote-Week9-Backend\backend
node server.js
```

**Check Terminal 3 - Frontend:**
```bash
# Should show: "Local: http://localhost:5175/" (or similar)
# If not running, start it:
cd BharatVote-Week9-Frontend
npm run dev
```

### Step 3: Verify Contract Deployment

Run this in a new terminal:
```bash
cd BharatVote-Week9-Backend
npm run deploy
```

Expected output:
```
✅ Contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Merkle root set on contract: 0x14797488f401c5bf9e4d4ebc49cbfb837db0c4ef270fcbdb967250229877f70c
```

### Step 4: Check MetaMask Connection

1. Open MetaMask
2. Make sure you're connected to **Hardhat Localhost** (Chain ID: 31337)
3. If not connected:
   - Click the network dropdown
   - Select "Hardhat Localhost" or add it manually:
     - Network Name: Hardhat Localhost
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

### Step 5: Clear Browser Cache and Refresh

1. Press `Ctrl+Shift+Delete` to open Clear Browsing Data
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`

## Common Error Messages and Solutions

### "Contract not deployed at this address"
**Solution:** Run `npm run deploy` in `BharatVote-Week9-Backend`

### "Wrong network! Connected to chain X, expected 31337"
**Solution:** Switch MetaMask to Hardhat Localhost (Chain ID: 31337)

### "Network error - ensure Hardhat node is running"
**Solution:** Start Hardhat node: `cd BharatVote-Week9-Backend && npm run node`

### "ABI mismatch"
**Solution:** 
1. Stop all services
2. Run `npm run deploy` again
3. Restart frontend

### "Contract call failed" with no specific reason
**Check:**
1. Browser console for detailed error messages
2. Hardhat node terminal for any errors
3. MetaMask is connected and on the correct network
4. Contract address matches: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Manual Contract Verification

You can manually verify the contract is working by running this in the browser console (F12):

```javascript
// Get the contract instance
const contract = window.ethereum ? await (async () => {
  const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  // You'll need to import the ABI, but this gives you the idea
  return new ethers.Contract(contractAddress, ABI, signer);
})() : null;

// Test a simple call
if (contract) {
  try {
    const count = await contract.candidateCount();
    console.log('Contract is working! Candidate count:', count.toString());
  } catch (err) {
    console.error('Contract call failed:', err);
  }
}
```

## Still Not Working?

1. **Restart everything in order:**
   - Stop all terminals (Ctrl+C)
   - Start Hardhat node
   - Deploy contract
   - Start backend
   - Start frontend
   - Clear browser cache
   - Refresh page

2. **Check the contract address matches:**
   - Open `BharatVote-Week9-Frontend/src/contracts/BharatVote.json`
   - Verify `address` field is `0x5FbDB2315678afecb367f032d93F642f64180aa3`

3. **Check network connectivity:**
   - Try accessing `http://127.0.0.1:8545` in your browser (should show JSON-RPC response)
   - Try accessing `http://localhost:3001/api/health` (should show backend status)
