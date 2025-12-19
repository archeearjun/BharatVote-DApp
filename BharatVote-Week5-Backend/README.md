# BharatVote - Week 5 Backend: Express Server Foundation

## 📋 Purpose

This is the **Week 5 backend implementation** of the BharatVote blockchain voting system. Week 5 focuses on the **Express.js backend server** that provides KYC validation and Merkle proof generation APIs. This week transforms the mock KYC server into a production-ready backend microservice.

### What Week 5 Achieves

- **Express.js Backend Server**: Production-ready API server with proper middleware
- **KYC Validation Endpoint**: `/api/kyc` - Validates voter IDs and returns wallet addresses
- **Merkle Proof Generation**: `/api/merkle-proof` - Generates cryptographic proofs for eligible voters
- **Security Middleware**: CORS, Helmet, rate limiting for production use
- **Error Handling**: Comprehensive error handling and validation
- **Production-Ready**: Scalable architecture ready for real-world deployment

---

## 🗂️ Project Structure

```
BharatVote-Week5-Backend/
├── contracts/
│   └── BharatVote.sol              # Smart contract (from Weeks 1-4)
│
├── scripts/
│   ├── deploy.ts                   # Deployment script
│   └── ...                         # Other utility scripts
│
├── mock-kyc-server/                # ⭐ WEEK 5 FOCUS: Express Backend Server
│   ├── server.js                   # Express server (~122 lines)
│   │                               # - KYC validation endpoint
│   │                               # - Merkle proof generation endpoint
│   │                               # - Security middleware
│   │                               # - Error handling
│   │
│   ├── kyc-data.json               # Mock voter KYC data
│   ├── package.json                # Server dependencies
│   └── README.md                   # Server documentation
│
├── proofs/                         # Generated Merkle proofs
├── hardhat.config.ts               # Hardhat configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

---

## 🆕 What's New in Week 5

### 1. Express.js Backend Server (Main Focus)

**Location:** `mock-kyc-server/server.js` (~122 lines)

**Key Features:**
- **Express.js Framework**: Production-ready Node.js web framework
- **CORS Middleware**: Enables cross-origin requests from frontend
- **Helmet.js**: Security headers for production
- **Rate Limiting**: Prevents API abuse (60 requests/minute)
- **Input Validation**: Sanitizes voter IDs to prevent injection
- **Error Handling**: Comprehensive error responses

**API Endpoints:**

1. **KYC Validation** - `GET /api/kyc?voter_id={VOTER_ID}`
   - Validates voter ID against KYC database
   - Returns eligibility status and wallet address
   - Response: `{ eligible: true, address: "0x..." }`

2. **Merkle Proof Generation** - `GET /api/merkle-proof?voter_id={VOTER_ID}`
   - Generates cryptographic Merkle proof for voter
   - Returns proof array for on-chain verification
   - Response: `{ proof: [...], merkleRoot: "0x..." }`

### 2. Security Features

**Input Sanitization:**
```javascript
const sanitizeVoterId = (id) =>
  typeof id === 'string' ? id.replace(/[\W-]/g, '').slice(0, 64) : '';
```

**Rate Limiting:**
```javascript
rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requests per minute
})
```

**Security Headers (Helmet):**
- XSS protection
- Content Security Policy
- Frame options
- HSTS headers

### 3. Merkle Tree Integration

**Tree Construction:**
```javascript
const leaves = eligibleVoters.map((addr) =>
  keccak256Hasher(addr.toLowerCase())
);
const tree = new MerkleTree(leaves, keccak256Hasher, {
  sortLeaves: true,
  sortPairs: true,
});
```

**Proof Generation:**
```javascript
const hashedAddress = keccak256Hasher(kycRecord.address.toLowerCase());
const proofElements = tree.getProof(hashedAddress);
const proof = proofElements.map((item) => `0x${item.data.toString('hex')}`);
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Week 4 backend completed (Merkle tree verification)

### Step-by-Step Setup

1. **Navigate to Week 5 backend directory**
   ```bash
   cd BharatVote-Week5-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install backend server dependencies**
   ```bash
   cd mock-kyc-server
   npm install
   cd ..
   ```

4. **Start local blockchain** (in a separate terminal)
   ```bash
   npm run node
   ```

5. **Deploy the contract** (in another terminal)
   ```bash
   npm run deploy
   ```

6. **Start the Express backend server** (⭐ Week 5 Focus!)
   ```bash
   cd mock-kyc-server
   npm start
   ```
   Server will start on `http://localhost:3001`

7. **Test the API endpoints**
   ```bash
   # Test KYC validation
   curl "http://localhost:3001/api/kyc?voter_id=VOTER1"
   
   # Test Merkle proof generation
   curl "http://localhost:3001/api/merkle-proof?voter_id=VOTER1"
   ```

---

## 🎯 Key Implementation Details

### 1. KYC Validation Endpoint

**Endpoint:** `GET /api/kyc?voter_id={VOTER_ID}`

**Flow:**
1. Receives voter ID from query parameter
2. Sanitizes input to prevent injection
3. Looks up voter in `kyc-data.json`
4. Returns eligibility status and wallet address

**Response Format:**
```json
{
  "eligible": true,
  "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
}
```

**Error Handling:**
- Missing voter_id → 400 Bad Request
- Voter not found → `{ eligible: false }`
- Server error → 500 Internal Server Error

### 2. Merkle Proof Generation Endpoint

**Endpoint:** `GET /api/merkle-proof?voter_id={VOTER_ID}`

**Flow:**
1. Receives voter ID from query parameter
2. Looks up voter in KYC data to get wallet address
3. Hashes the address to create Merkle leaf
4. Generates proof path from leaf to root
5. Verifies proof internally
6. Returns proof array and Merkle root

**Response Format:**
```json
{
  "proof": [
    "0x2d8cf8e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
    "0x1b7c8e9e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"
  ],
  "merkleRoot": "0x..."
}
```

**Error Handling:**
- Missing voter_id → 400 Bad Request
- Voter not found → 403 Forbidden
- Invalid proof → 403 Forbidden
- Server error → 500 Internal Server Error

### 3. Security Implementation

**CORS Configuration:**
```javascript
app.use(cors());  // Allows all origins (configure for production)
```

**Rate Limiting:**
- 60 requests per minute per IP
- Prevents API abuse and DoS attacks
- Returns 429 Too Many Requests when exceeded

**Input Sanitization:**
- Removes special characters
- Limits length to 64 characters
- Prevents SQL injection and XSS

---

## 📊 What's Included vs. What's Not

### ✅ Included in Week 5

- **Express.js Server**: Production-ready API server
- **KYC Validation API**: `/api/kyc` endpoint
- **Merkle Proof API**: `/api/merkle-proof` endpoint
- **Security Middleware**: CORS, Helmet, rate limiting
- **Error Handling**: Comprehensive error responses
- **Input Validation**: Sanitization and validation
- **Production-Ready**: Scalable architecture

### ⚠️ Simplified in Week 5 (Full Version in Week 6+)

- **Database Integration**: Currently uses JSON files, Week 6+ adds database
- **Authentication**: No auth required, Week 6+ adds JWT tokens
- **Caching**: No proof caching, Week 6+ adds Redis
- **Logging**: Basic console logging, Week 6+ adds structured logging

### ❌ Not Included (Coming Later)

- **Database**: SQL/NoSQL database integration - Week 6+
- **Authentication**: JWT token authentication - Week 6+
- **Caching**: Redis caching for proofs - Week 6+
- **Monitoring**: Application monitoring and metrics - Week 7+
- **Testing**: Comprehensive API tests - Week 7+

---

## 🔄 Differences from Week 4

| Feature | Week 4 | Week 5 |
|---------|--------|--------|
| **Backend Server** | Mock server (basic) | Production Express server |
| **Security** | Basic | CORS, Helmet, rate limiting |
| **Error Handling** | Basic | Comprehensive |
| **Input Validation** | Minimal | Full sanitization |
| **Documentation** | Basic | Complete API docs |
| **Production Ready** | ❌ | ✅ |

---

## 🐛 Troubleshooting

### Error: "Cannot GET /api/kyc"
**Cause**: Server not running or wrong port.
**Solution**: 
- Verify server is running: `npm start` in `mock-kyc-server/`
- Check port 3001 is not in use
- Verify endpoint URL: `http://localhost:3001/api/kyc`

### Error: "CORS policy blocked"
**Cause**: CORS not configured or frontend on different origin.
**Solution**:
- Verify `app.use(cors())` is in server.js
- Check frontend is calling correct backend URL
- For production, configure CORS with specific origins

### Error: "Too many requests"
**Cause**: Rate limit exceeded (60 requests/minute).
**Solution**:
- Wait 1 minute before retrying
- Reduce request frequency in frontend
- Adjust rate limit in server.js if needed

### Error: "Voter not found"
**Cause**: Voter ID doesn't exist in KYC data.
**Solution**:
- Check `kyc-data.json` for valid voter IDs
- Use test IDs: "VOTER1", "VOTER2", "VOTER3", "VOTER4"
- Verify voter ID spelling and case

---

## 📚 Additional Resources

- **Express.js Docs**: https://expressjs.com/
- **MerkleTreeJS Docs**: https://github.com/miguelmota/merkletreejs
- **Helmet.js Docs**: https://helmetjs.github.io/
- **Week 4 README**: For Merkle tree implementation details

---

## 🎓 Learning Outcomes

By completing Week 5, you understand:

1. **Express.js**: Building RESTful APIs with Express
2. **API Design**: RESTful endpoint design and best practices
3. **Security**: CORS, rate limiting, input validation
4. **Error Handling**: Comprehensive error responses
5. **Production Architecture**: Scalable backend design
6. **Merkle Proofs**: Server-side proof generation

---

**Week 5 Complete! Ready for Week 6: Advanced Deployment Scripts! 🎉**
