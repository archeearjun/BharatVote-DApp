# 🚀 IPFS Quick Setup - BharatVote

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- Pinata account (free)

### Step 1: Get Pinata API Keys (2 minutes)
```
1. Visit: https://app.pinata.cloud/
2. Sign up (free)
3. Go to: API Keys → New Key
4. Enable: pinFileToIPFS, pinJSONToIPFS, unpin, pinList
5. Copy: API Key & API Secret
```

### Step 2: Configure Backend (1 minute)
```bash
cd backend
copy .env.example .env
```

Edit `.env`:
```env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_secret_key_here
```

### Step 3: Install & Run (2 minutes)
```bash
npm install
npm run start:ipfs
```

✅ **Done!** Your data is now on IPFS!

---

## 📋 Quick Commands

### Start Backend with IPFS
```bash
cd backend
npm run start:ipfs
```

### Check IPFS Status
```bash
curl http://localhost:3001/api/health
```

### Get IPFS References
```bash
curl http://localhost:3001/api/ipfs/references
```

### View Stored Data
```bash
curl http://localhost:3001/api/ipfs/data/QmYOUR_HASH_HERE
```

### Store Election Results
```bash
curl -X POST http://localhost:3001/api/ipfs/store-results \
  -H "Content-Type: application/json" \
  -d '{"electionId": 1, "candidates": [], "tally": [], "totalVotes": 0}'
```

---

## 🎯 What Gets Stored on IPFS?

✅ **Automatically Stored on Startup:**
- KYC verification data (privacy-hashed)
- Eligible voters list
- Initial audit trail

✅ **Stored via API:**
- Election results (after election ends)
- Updated audit trails
- Candidate manifestos

✅ **Stored on Blockchain:**
- IPFS hashes (pointers to data)
- Merkle root
- Vote commits & reveals
- Tallies

---

## 🔍 Verify Your Data

### 1. Check Console Output
Look for:
```
✅ KYC Data: https://gateway.pinata.cloud/ipfs/QmXXX...
✅ Voter List: https://gateway.pinata.cloud/ipfs/QmYYY...
✅ Audit Trail: https://gateway.pinata.cloud/ipfs/QmZZZ...
```

### 2. Visit Pinata Dashboard
```
https://app.pinata.cloud/pinmanager
```
You should see 3+ pinned files!

### 3. Access via Gateway
```
https://gateway.pinata.cloud/ipfs/YOUR_HASH
```

### 4. Deploy Contract with IPFS Hashes
```bash
npx hardhat run scripts/deploy-with-ipfs.ts --network localhost
```

---

## 🔧 Troubleshooting

### "Authentication failed"
→ Check API keys in `.env`
→ Regenerate keys on Pinata dashboard

### "Failed to pin"
→ Check internet connection
→ Verify Pinata service status
→ Check free tier limits (1GB max)

### "IPFS not initializing"
→ Run `npm install` again
→ Check `.env` file exists
→ Try fallback: `npm start` (without IPFS)

---

## 📊 Current Status Check

**Before IPFS:**
```
❌ Data on centralized backend
❌ Single point of failure
❌ No data immutability
❌ No audit trail
```

**After IPFS:**
```
✅ Data on decentralized IPFS
✅ Distributed & redundant
✅ Content-addressed (immutable)
✅ Full audit trail on-chain
```

---

## 🎓 Understanding the Architecture

```
Your Backend → IPFS (Pinata) → Get IPFS Hash → Store Hash on Smart Contract
                                     ↓
                            Anyone Can Retrieve
                            Data Using Hash!
```

**Key Insight:** 
- Blockchain stores IPFS hashes (small, cheap)
- IPFS stores actual data (large, decentralized)
- Best of both worlds! 🌟

---

## 📚 Next Steps

1. ✅ **Deploy Contract**: `npx hardhat run scripts/deploy-with-ipfs.ts`
2. ✅ **Update Frontend**: Add contract address
3. ✅ **Test Voting**: Use eligible voter addresses
4. ✅ **Archive Results**: Store final results on IPFS
5. ✅ **Verify Data**: Check IPFS gateways

---

## 🆘 Need Help?

- **Pinata Docs**: https://docs.pinata.cloud/
- **IPFS Docs**: https://docs.ipfs.tech/
- **Full Guide**: See `IPFS_INTEGRATION_GUIDE.md`

---

## ⚡ Pro Tips

1. **Save IPFS Hashes**: Keep them in `ipfs-references.json`
2. **Multiple Gateways**: Try different ones if one is slow
3. **Pin Important Data**: Don't unpin active election data
4. **Monitor Usage**: Check Pinata dashboard regularly
5. **Backup**: Download IPFS data periodically

---

**Status**: ✅ Your BharatVote data is now decentralized & tamper-proof!

