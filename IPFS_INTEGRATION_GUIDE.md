# 🌐 BharatVote IPFS Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [What's Stored On-Chain vs Off-Chain](#whats-stored-on-chain-vs-off-chain)
3. [Why IPFS?](#why-ipfs)
4. [Architecture](#architecture)
5. [Setup Instructions](#setup-instructions)
6. [Usage Guide](#usage-guide)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

BharatVote now integrates with **IPFS (InterPlanetary File System)** via **Pinata** to store critical election data in a decentralized, immutable, and censorship-resistant manner. Even though we use mock KYC data for this project, this implementation demonstrates how to properly safeguard data on the blockchain.

### Current Data Storage Analysis

#### ✅ **Already On-Chain** (Ethereum Blockchain)
- ✓ Candidate information (names, IDs)
- ✓ Merkle root for voter eligibility
- ✓ Vote commits (encrypted hashes)
- ✓ Vote tallies (final results)
- ✓ Voter status (who committed/revealed)

#### ❌ **Currently Off-Chain** (Centralized Backend - Security Risk!)
- ✗ KYC data (voter ID → Ethereum address mapping)
- ✗ Eligible voters list
- ✗ Merkle tree generation logic
- ✗ Audit trails

#### ✅ **Now Stored on IPFS** (Decentralized Solution)
- ✓ KYC verification data (with privacy hashing)
- ✓ Eligible voters list with timestamps
- ✓ Election results archives
- ✓ Audit trail logs
- ✓ Candidate manifestos/profiles

---

## 🤔 Why IPFS?

### Problems with Centralized Storage
1. **Single Point of Failure**: If backend server goes down, KYC verification fails
2. **Data Tampering**: Centralized data can be modified without audit trail
3. **Censorship Risk**: Data can be removed or blocked
4. **No Immutability**: Historical data can be altered

### Benefits of IPFS Storage
1. **Decentralization**: Data distributed across multiple nodes
2. **Immutability**: Content-addressed (hash-based), cannot be tampered
3. **Availability**: Data persists even if your server goes down
4. **Transparency**: All data changes create new IPFS hashes
5. **Cost-Effective**: Pay only for pinning service (Pinata free tier available)
6. **Blockchain Integration**: Store IPFS hashes on-chain for verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BHARATVOTE SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐       ┌──────────────┐                  │
│  │   Frontend   │◄─────►│   Backend    │                  │
│  │  (React)     │       │  (Express)   │                  │
│  └──────────────┘       └──────┬───────┘                  │
│         │                       │                           │
│         │                       │                           │
│         ▼                       ▼                           │
│  ┌──────────────┐       ┌──────────────┐                  │
│  │ Smart Contract│      │ IPFS Service │                  │
│  │  (Solidity)   │      │  (Pinata)    │                  │
│  └──────┬────────┘       └──────┬───────┘                  │
│         │                       │                           │
│         │                       │                           │
│         ▼                       ▼                           │
│  ┌──────────────────────────────────┐                     │
│  │        Ethereum Blockchain        │                     │
│  ├───────────────────────────────────┤                     │
│  │ • Vote commits/reveals            │                     │
│  │ • Candidate info                  │                     │
│  │ • Merkle root                     │                     │
│  │ • IPFS hashes (pointers)          │◄───────────┐       │
│  └───────────────────────────────────┘            │       │
│                                                    │       │
│  ┌──────────────────────────────────┐            │       │
│  │           IPFS Network            │            │       │
│  ├───────────────────────────────────┤            │       │
│  │ • KYC data                        │◄───────────┘       │
│  │ • Voter lists                     │                     │
│  │ • Election results                │                     │
│  │ • Audit trails                    │                     │
│  │ • Candidate manifestos            │                     │
│  └───────────────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Data Storage**: Backend stores sensitive data on IPFS via Pinata
2. **IPFS Hash Generation**: IPFS returns unique content hash (CID)
3. **On-Chain Storage**: Smart contract stores IPFS hash
4. **Data Retrieval**: Anyone can retrieve data using IPFS hash
5. **Verification**: Compare retrieved data hash with on-chain hash

---

## 🚀 Setup Instructions

### Step 1: Get Pinata API Keys

1. Go to [Pinata Cloud](https://app.pinata.cloud/)
2. Sign up for a free account (1GB storage free)
3. Navigate to **API Keys** section
4. Create a new API key with the following permissions:
   - ✓ pinFileToIPFS
   - ✓ pinJSONToIPFS
   - ✓ unpin
   - ✓ pinList
5. Copy your **API Key** and **API Secret**

### Step 2: Configure Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
copy .env.example .env    # Windows
# or
cp .env.example .env      # Linux/Mac
```

3. Edit `.env` file with your Pinata credentials:
```env
PORT=3001

# Pinata IPFS Configuration
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_KEY=your_actual_secret_key_here

# Other configurations...
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `axios` - HTTP client for Pinata API
- `form-data` - For file uploads to IPFS
- `dotenv` - Environment variable management

### Step 4: Start Backend with IPFS

```bash
npm run start:ipfs
```

You should see:
```
🚀 Initializing IPFS storage...
✅ Pinata authentication successful
📤 Storing KYC data on IPFS...
✅ KYC Data: https://gateway.pinata.cloud/ipfs/QmXXXXX...
📤 Storing eligible voters list on IPFS...
✅ Voter List: https://gateway.pinata.cloud/ipfs/QmYYYYY...
✅ IPFS initialization complete!

📋 IPFS References:
{
  "kycDataHash": "QmXXXXX...",
  "voterListHash": "QmYYYYY...",
  "auditTrailHash": "QmZZZZZ..."
}

💡 Store these IPFS hashes on-chain using the smart contract!

🚀 BharatVote Backend (IPFS-enabled) running at http://localhost:3001
```

### Step 5: Deploy Smart Contract with IPFS Support

```bash
npx hardhat compile
npx hardhat run scripts/deploy-with-ipfs.ts --network localhost
```

---

## 📚 Usage Guide

### 1. Storing Data on IPFS

#### Automatic Storage (On Server Start)
When you start the backend with `npm run start:ipfs`, it automatically:
1. Uploads KYC data to IPFS
2. Uploads eligible voters list to IPFS
3. Creates initial audit trail on IPFS
4. Saves IPFS hashes locally

#### Manual Storage via API

**Store Election Results:**
```bash
curl -X POST http://localhost:3001/api/ipfs/store-results \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": 1,
    "candidates": [...],
    "tally": [100, 150, 200],
    "totalVotes": 450,
    "phase": 2,
    "merkleRoot": "0x..."
  }'
```

**Update Audit Trail:**
```bash
curl -X POST http://localhost:3001/api/ipfs/update-audit
```

### 2. Retrieving Data from IPFS

#### Get IPFS References
```bash
curl http://localhost:3001/api/ipfs/references
```

Response:
```json
{
  "kycDataHash": "QmXXXXX...",
  "voterListHash": "QmYYYYY...",
  "resultsHash": "QmZZZZZ...",
  "auditTrailHash": "QmWWWWW..."
}
```

#### Retrieve Data by Hash
```bash
curl http://localhost:3001/api/ipfs/data/QmXXXXX...
```

#### Direct IPFS Gateway Access
```
https://gateway.pinata.cloud/ipfs/QmXXXXX...
```

### 3. On-Chain IPFS Hash Storage

After deploying the contract, store IPFS hashes on-chain:

```javascript
// Using ethers.js
const contract = await ethers.getContractAt("BharatVoteWithIPFS", contractAddress);

// Set KYC data hash
await contract.setKYCDataIPFS("QmXXXXX...");

// Set voter list hash
await contract.setVoterListIPFS("QmYYYYY...");

// Set audit trail hash
await contract.setAuditTrailIPFS("QmZZZZZ...");

// Archive results (only after election finishes)
await contract.archiveResults("QmWWWWW...");
```

### 4. Verification Flow

```javascript
// 1. Get IPFS hash from smart contract
const electionData = await contract.getCurrentElectionData();
console.log("KYC Data IPFS Hash:", electionData.kycDataIPFS);

// 2. Retrieve data from IPFS
const response = await fetch(`https://gateway.pinata.cloud/ipfs/${electionData.kycDataIPFS}`);
const kycData = await response.json();

// 3. Verify data integrity
const crypto = require('crypto');
const dataHash = crypto.createHash('sha256').update(JSON.stringify(kycData)).digest('hex');
console.log("Data integrity verified:", dataHash);
```

---

## 🔒 Security Considerations

### 1. Privacy Protection

**Problem**: KYC data contains sensitive voter information.

**Solution**: Hash sensitive data before storing on IPFS:

```javascript
// In ipfs-service.js
const kycPayload = {
  data: kycData.map(record => ({
    voterId: record.voterId,
    addressHash: hashAddress(record.address), // One-way hash
    verificationStatus: 'verified'
  }))
};
```

### 2. Access Control

**On Smart Contract:**
- Only admin can set IPFS hashes
- Only admin can archive results
- All changes emit events for transparency

**On Backend:**
- Rate limiting (60 requests/minute)
- Input sanitization
- CORS protection
- Helmet security headers

### 3. Data Immutability

- IPFS uses content-addressing (hash of data = address)
- Any change to data = new IPFS hash
- Old data remains accessible with old hash
- On-chain IPFS hashes create audit trail

### 4. Pinning Strategy

**Free Tier (Pinata):**
- 1 GB storage
- Suitable for mock data and development

**Production Recommendations:**
1. Use paid Pinata plan for larger datasets
2. Pin critical data to multiple services (Pinata + Infura)
3. Set up automatic re-pinning for important hashes
4. Monitor pin status regularly

---

## 🧪 Testing

### Test Backend IPFS Integration

```bash
# Start backend
cd backend
npm run start:ipfs

# In another terminal, test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/ipfs/references
curl http://localhost:3001/api/audit-trail
```

### Test Smart Contract IPFS Functions

```bash
npx hardhat test test/BharatVoteWithIPFS.test.ts
```

Create test file `test/BharatVoteWithIPFS.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BharatVoteWithIPFS", function () {
  it("Should set and retrieve IPFS hashes", async function () {
    const [admin] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("BharatVoteWithIPFS");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();

    // Set KYC data hash
    const kycHash = "QmTestKYCHash123";
    await contract.setKYCDataIPFS(kycHash);

    // Retrieve and verify
    const electionData = await contract.getCurrentElectionData();
    expect(electionData.kycDataIPFS).to.equal(kycHash);
  });

  it("Should emit events when storing IPFS hashes", async function () {
    const [admin] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("BharatVoteWithIPFS");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();

    const voterHash = "QmTestVoterHash456";
    await expect(contract.setVoterListIPFS(voterHash))
      .to.emit(contract, "VoterListStored")
      .withArgs(voterHash, await time.latest());
  });
});
```

### Verify IPFS Data Integrity

```javascript
// verify-ipfs.js
const axios = require('axios');
const crypto = require('crypto');

async function verifyIPFSData(ipfsHash, expectedData) {
    // Retrieve from IPFS
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    const retrievedData = response.data;

    // Hash both datasets
    const retrievedHash = crypto.createHash('sha256')
        .update(JSON.stringify(retrievedData))
        .digest('hex');
    const expectedHash = crypto.createHash('sha256')
        .update(JSON.stringify(expectedData))
        .digest('hex');

    console.log('Data integrity check:', retrievedHash === expectedHash ? '✅ PASS' : '❌ FAIL');
    return retrievedHash === expectedHash;
}

// Usage
verifyIPFSData('QmXXXXX...', originalKycData);
```

---

## 🔧 Troubleshooting

### Issue: "Pinata authentication failed"

**Solution:**
1. Verify your API keys are correct in `.env`
2. Check if keys have proper permissions
3. Try regenerating keys on Pinata dashboard

### Issue: "Failed to pin data to IPFS"

**Solution:**
1. Check your internet connection
2. Verify Pinata service status: https://status.pinata.cloud/
3. Check if you've exceeded free tier limits (1GB)
4. Review file size (max 100MB per file)

### Issue: "IPFS data not retrieving"

**Solution:**
1. Verify IPFS hash is correct (starts with "Qm" for CIDv0)
2. Try different gateways:
   - `https://gateway.pinata.cloud/ipfs/[hash]`
   - `https://ipfs.io/ipfs/[hash]`
   - `https://cloudflare-ipfs.com/ipfs/[hash]`
3. Check if data is still pinned: use Pinata dashboard

### Issue: "Backend runs but no IPFS storage"

**Solution:**
1. Check console logs for error messages
2. Verify `.env` file exists and has correct keys
3. Install missing dependencies: `npm install`
4. Try running without IPFS: `npm start` (fallback mode)

---

## 📊 Comparison: Before vs After IPFS Integration

| Aspect | Before (Centralized) | After (IPFS) |
|--------|---------------------|--------------|
| **KYC Data Storage** | Local JSON file | IPFS (decentralized) |
| **Data Availability** | Server uptime dependent | Always available |
| **Data Integrity** | Can be tampered | Immutable (content-addressed) |
| **Audit Trail** | None | Full history on-chain |
| **Censorship Resistance** | Vulnerable | Resistant |
| **Cost** | Server costs | Minimal (free tier) |
| **Transparency** | Limited | Full (all hashes on-chain) |
| **Single Point of Failure** | Yes (backend server) | No (distributed) |

---

## 🎯 Best Practices

### 1. For Development (Mock Data)
- ✓ Use Pinata free tier (1GB)
- ✓ Store IPFS hashes in contract events
- ✓ Keep local copies of IPFS hashes
- ✓ Test data retrieval from multiple gateways

### 2. For Production (Real Data)
- ✓ Use paid Pinata plan or multiple services
- ✓ Implement data encryption before IPFS upload
- ✓ Set up automatic pinning monitoring
- ✓ Create backup strategies (multiple pinning services)
- ✓ Implement access control for sensitive data
- ✓ Regular audits of pinned data

### 3. For Scalability
- ✓ Batch uploads to reduce API calls
- ✓ Implement caching layer (Redis)
- ✓ Use CDN for IPFS gateway
- ✓ Monitor IPFS gateway performance
- ✓ Implement retry logic for failed uploads

---

## 📚 Additional Resources

- **Pinata Documentation**: https://docs.pinata.cloud/
- **IPFS Documentation**: https://docs.ipfs.tech/
- **IPFS Best Practices**: https://docs.ipfs.tech/how-to/best-practices-for-nft-data/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Ethers.js Documentation**: https://docs.ethers.org/

---

## 🎉 Summary

Your BharatVote project now has:

1. ✅ **Decentralized Data Storage**: All critical data on IPFS
2. ✅ **Enhanced Smart Contract**: Stores and manages IPFS hashes on-chain
3. ✅ **IPFS Service**: Automated data upload/retrieval
4. ✅ **Audit Trail**: Full transparency of all data changes
5. ✅ **Data Integrity**: Content-addressed, immutable storage
6. ✅ **High Availability**: Data accessible even if backend fails

Even with mock KYC data, you've implemented a production-ready architecture that demonstrates proper blockchain data management! 🚀

