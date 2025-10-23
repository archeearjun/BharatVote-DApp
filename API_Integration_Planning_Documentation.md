# BharatVote - API and Integration Planning Documentation

## 2.5 API and Integration Planning

### Project Overview
BharatVote implements a decentralized voting system with multiple integration layers including blockchain smart contracts, backend APIs for KYC verification, and secure wallet integrations. The system uses a hybrid architecture combining traditional web services with blockchain technology.

---

## 2.5.1 API Design

### Backend API Specification

#### Base Configuration
- **Protocol**: HTTPS (Production) / HTTP (Development)
- **Base URL**: `http://localhost:3001` (Development) / `https://api.bharatvote.com` (Production)
- **Content-Type**: `application/json`
- **CORS**: Enabled for cross-origin requests from frontend domains

#### API Endpoints

### 1. KYC Verification Endpoint

#### `GET /api/kyc`

**Purpose**: Verify voter eligibility through KYC (Know Your Customer) validation

**Request Parameters:**
```json
{
  "voter_id": "string (required)" // Voter identification number
}
```

**Request Method**: `GET`
**Query Parameters**: `?voter_id={VOTER_ID}`

**Sample Request:**
```bash
curl -X GET "http://localhost:3001/api/kyc?voter_id=VOTER1" \
  -H "Content-Type: application/json"
```

**Response Formats:**

**Success Response (200 OK):**
```json
{
  "eligible": true,
  "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
}
```

**Not Found Response (200 OK):**
```json
{
  "eligible": false
}
```

**Error Response (400 Bad Request):**
```json
{
  "eligible": false,
  "error": "voter_id is required"
}
```

**Response Fields:**
- `eligible` (boolean): Whether the voter is eligible to vote
- `address` (string, optional): Ethereum address associated with the voter
- `error` (string, optional): Error message if request failed

**Error Handling:**
- **400 Bad Request**: Missing or invalid voter_id parameter
- **500 Internal Server Error**: Database or system error
- **503 Service Unavailable**: KYC service temporarily unavailable

---

### 2. Merkle Proof Generation Endpoint

#### `GET /api/merkle-proof`

**Purpose**: Generate Merkle proof for voter eligibility verification on blockchain

**Request Parameters:**
```json
{
  "voter_id": "string (required)" // Voter identification number
}
```

**Request Method**: `GET`
**Query Parameters**: `?voter_id={VOTER_ID}`

**Sample Request:**
```bash
curl -X GET "http://localhost:3001/api/merkle-proof?voter_id=VOTER1" \
  -H "Content-Type: application/json"
```

**Response Formats:**

**Success Response (200 OK):**
```json
[
  "0x2d8cf8e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
  "0x1b7c8e9e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
  "0x9f2c8e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"
]
```

**Error Response (400 Bad Request):**
```json
{
  "error": "voter_id is required"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Voter ID not found in KYC records"
}
```

**Error Response (403 Forbidden - Invalid Proof):**
```json
{
  "error": "Voter not eligible or proof invalid"
}
```

**Response Format:**
- Success: Array of hex-encoded Merkle proof elements
- Error: Object with error message

**Error Handling:**
- **400 Bad Request**: Missing voter_id parameter
- **403 Forbidden**: Voter not found in KYC records or invalid proof
- **500 Internal Server Error**: Merkle tree generation error

---

## 2.5.2 Integration Points

### 1. Blockchain Integration

#### Smart Contract Interface

**Contract Address**: Dynamically loaded from deployment artifacts
**Network**: Ethereum (Mainnet/Testnet) or Hardhat Local Network
**Chain ID**: 31337 (Local) / 1 (Mainnet) / 11155111 (Sepolia Testnet)

**Key Contract Methods:**

##### Read Methods:
```typescript
// Get election phase (0: Commit, 1: Reveal, 2: Finished)
async function getPhase(): Promise<number>

// Get candidate information
async function getCandidates(): Promise<Candidate[]>

// Check if user has committed a vote
async function hasCommitted(address: string): Promise<boolean>

// Check if user has revealed their vote
async function hasRevealed(address: string): Promise<boolean>

// Get vote tally for specific candidate
async function tally(candidateId: number): Promise<number>

// Get admin address
async function admin(): Promise<string>
```

##### Write Methods:
```typescript
// Commit a vote with hash (Commit Phase)
async function commitVote(
  voteHash: string,
  merkleProof: string[]
): Promise<TransactionResponse>

// Reveal vote with original values (Reveal Phase)
async function revealVote(
  candidateId: number,
  salt: string
): Promise<TransactionResponse>

// Admin: Add new candidate
async function addCandidate(name: string): Promise<TransactionResponse>

// Admin: Remove candidate
async function removeCandidate(candidateId: number): Promise<TransactionResponse>

// Admin: Advance election phase
async function advancePhase(): Promise<TransactionResponse>

// Admin: Reset election
async function resetElection(): Promise<TransactionResponse>
```

**Integration Implementation:**
```typescript
// Example contract interaction
import { BharatVote__factory } from "@typechain/factories/BharatVote.sol/BharatVote__factory";
import { ethers } from "ethers";

// Initialize contract connection
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = BharatVote__factory.connect(contractAddress, signer);

// Example: Commit vote
const voteHash = ethers.solidityPackedKeccak256(
  ["uint256", "string"],
  [candidateId, salt]
);
const tx = await contract.commitVote(voteHash, merkleProof);
await tx.wait();
```

---

### 2. MetaMask Wallet Integration

#### Web Integration (Frontend)

**Connection Flow:**
```typescript
// MetaMask detection and connection
if (window.ethereum) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
}
```

**Event Handlers:**
```typescript
// Account change detection
window.ethereum.on('accountsChanged', (accounts: string[]) => {
  // Handle account switch
});

// Network change detection
window.ethereum.on('chainChanged', (chainId: string) => {
  // Handle network switch
});
```

**Network Validation:**
```typescript
// Ensure correct network
const network = await provider.getNetwork();
const requiredChainId = 31337; // Hardhat local

if (Number(network.chainId) !== requiredChainId) {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
  });
}
```

#### Mobile Integration (React Native)

**Deep Link Configuration:**
```typescript
// MetaMask deep link URLs
const METAMASK_DEEPLINKS = {
  DEEPLINK_BASE: 'metamask://',
  UNIVERSAL_LINK: 'https://metamask.app.link',
  PLAY_STORE: 'https://play.google.com/store/apps/details?id=io.metamask',
  APP_STORE: 'https://apps.apple.com/app/metamask/id1438144202'
};
```

**Connection Service:**
```typescript
class MetaMaskService {
  // Check if MetaMask is installed
  async isMetaMaskInstalled(): Promise<boolean> {
    return await Linking.canOpenURL(METAMASK_DEEPLINKS.DEEPLINK_BASE);
  }
  
  // Open MetaMask for connection
  async connectWallet(): Promise<WalletConnection> {
    const deepLink = `${METAMASK_DEEPLINKS.UNIVERSAL_LINK}/connect`;
    await Linking.openURL(deepLink);
  }
}
```

---

### 3. Backend API Integration

#### Frontend Integration (React/TypeScript)

**API Client Configuration:**
```typescript
// API base configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// KYC verification
async function verifyKYC(voterId: string): Promise<KYCResponse> {
  const response = await fetch(`${BACKEND_URL}/api/kyc?voter_id=${voterId}`);
  
  if (!response.ok) {
    throw new Error(`KYC verification failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Merkle proof generation
async function getMerkleProof(voterId: string): Promise<string[]> {
  const response = await fetch(`${BACKEND_URL}/api/merkle-proof?voter_id=${voterId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get Merkle proof');
  }
  
  return await response.json();
}
```

#### Mobile Integration (React Native)

**Native API Calls:**
```typescript
// React Native fetch with proper error handling
import AsyncStorage from '@react-native-async-storage/async-storage';

class APIService {
  private baseURL = 'http://10.0.2.2:3001'; // Android emulator
  
  async verifyKYC(voterId: string): Promise<KYCResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/kyc?voter_id=${voterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }
  
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  }
}
```

---

### 4. Cross-Platform State Management

#### Shared Data Flow:
```typescript
// Unified state management across platforms
interface AppState {
  wallet: {
    isConnected: boolean;
    account: string | null;
    chainId: number | null;
  };
  kyc: {
    isVerified: boolean;
    voterId: string | null;
  };
  voting: {
    phase: number;
    candidates: Candidate[];
    hasCommitted: boolean;
    hasRevealed: boolean;
  };
}
```

---

## 2.5.3 Security Measures

### 1. Authentication and Authorization

#### Blockchain-Based Authentication

**No Traditional Authentication**: BharatVote uses blockchain wallet signatures instead of username/password or JWT tokens.

**Wallet-Based Identity:**
```typescript
// User authentication through wallet connection
const authenticate = async (): Promise<AuthResult> => {
  // User must connect MetaMask wallet
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  // Wallet address serves as user identity
  const userAddress = accounts[0];
  
  // Verify signature for additional security (optional)
  const message = `Authenticate for BharatVote: ${Date.now()}`;
  const signature = await signer.signMessage(message);
  
  return {
    address: userAddress,
    signature,
    timestamp: Date.now()
  };
};
```

#### Role-Based Access Control:

**Admin Verification:**
```typescript
// Check if connected wallet is admin
const checkAdminStatus = async (
  contract: BharatVote, 
  userAddress: string
): Promise<boolean> => {
  const adminAddress = await contract.admin();
  return adminAddress.toLowerCase() === userAddress.toLowerCase();
};
```

**Voter Eligibility:**
```typescript
// Verify voter eligibility using Merkle proof
const verifyVoterEligibility = async (
  voterId: string
): Promise<{ eligible: boolean; proof?: string[] }> => {
  // 1. Check KYC status
  const kycResult = await verifyKYC(voterId);
  if (!kycResult.eligible) {
    return { eligible: false };
  }
  
  // 2. Generate Merkle proof
  const proof = await getMerkleProof(voterId);
  
  // 3. Verify proof on blockchain
  const isValid = await contract.verifyEligibility(proof, kycResult.address);
  
  return { eligible: isValid, proof };
};
```

---

### 2. Data Security and Privacy

#### Vote Privacy Protection:

**Commit-Reveal Mechanism:**
```typescript
// Commit phase: Hash vote with salt
const commitVote = async (candidateId: number, salt: string): Promise<void> => {
  // Create hash of vote + salt
  const voteHash = ethers.solidityPackedKeccak256(
    ["uint256", "string"],
    [candidateId, salt]
  );
  
  // Commit hash to blockchain (vote remains private)
  const tx = await contract.commitVote(voteHash, merkleProof);
  await tx.wait();
};

// Reveal phase: Reveal original vote
const revealVote = async (candidateId: number, salt: string): Promise<void> => {
  // Submit original values for verification
  const tx = await contract.revealVote(candidateId, salt);
  await tx.wait();
};
```

#### Data Encryption:

**Sensitive Data Handling:**
```typescript
// Encrypt sensitive data before storage
import CryptoJS from 'crypto-js';

const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

const decryptData = (encryptedData: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Store encrypted vote commitment locally (backup)
const storeVoteCommitment = (candidateId: number, salt: string): void => {
  const commitment = JSON.stringify({ candidateId, salt, timestamp: Date.now() });
  const encrypted = encryptData(commitment, userAddress);
  localStorage.setItem('vote_commitment', encrypted);
};
```

---

### 3. API Security

#### Input Validation and Sanitization:

**Backend Validation:**
```javascript
// Express.js input validation middleware
const validateVoterId = (req, res, next) => {
  const { voter_id } = req.query;
  
  // Check if voter_id exists
  if (!voter_id) {
    return res.status(400).json({ 
      eligible: false, 
      error: 'voter_id is required' 
    });
  }
  
  // Validate format (alphanumeric, 3-20 characters)
  const voterIdRegex = /^[A-Za-z0-9]{3,20}$/;
  if (!voterIdRegex.test(voter_id)) {
    return res.status(400).json({ 
      eligible: false, 
      error: 'Invalid voter_id format' 
    });
  }
  
  next();
};

// Apply validation to routes
app.get('/api/kyc', validateVoterId, (req, res) => {
  // Handler logic
});
```

#### CORS Configuration:

**Cross-Origin Resource Sharing:**
```javascript
// CORS configuration for production
const corsOptions = {
  origin: [
    'https://bharatvote.com',
    'https://app.bharatvote.com',
    'http://localhost:3000', // Development
    'http://localhost:5173'  // Vite dev server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

#### Rate Limiting:

**API Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limiting for KYC endpoint
const kycLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many KYC requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for Merkle proof endpoint
const proofLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // More restrictive for computationally expensive operation
  message: {
    error: 'Too many proof requests, please try again later'
  }
});

app.use('/api/kyc', kycLimiter);
app.use('/api/merkle-proof', proofLimiter);
```

---

### 4. Blockchain Security

#### Smart Contract Security:

**Access Control:**
```solidity
// Solidity access control modifiers
modifier onlyAdmin() {
    if (msg.sender != admin) revert NotAdmin();
    _;
}

modifier onlyPhase(uint8 p) {
    if (phase != p) revert WrongPhase();
    _;
}

// Prevent double voting
modifier hasNotCommitted() {
    if (hasCommitted[msg.sender]) revert AlreadyCommitted();
    _;
}

modifier hasNotRevealed() {
    if (hasRevealed[msg.sender]) revert AlreadyRevealed();
    _;
}
```

#### Transaction Security:

**Gas Optimization and Security:**
```typescript
// Estimate gas before transaction
const estimateGas = async (contractMethod: any, ...args: any[]): Promise<bigint> => {
  try {
    const gasEstimate = await contractMethod.estimateGas(...args);
    // Add 20% buffer for gas price fluctuations
    return gasEstimate * BigInt(120) / BigInt(100);
  } catch (error) {
    throw new Error(`Gas estimation failed: ${error.message}`);
  }
};

// Secure transaction execution
const executeTransaction = async (
  contractMethod: any, 
  ...args: any[]
): Promise<TransactionReceipt> => {
  try {
    const gasLimit = await estimateGas(contractMethod, ...args);
    
    const tx = await contractMethod(...args, {
      gasLimit,
      // Use current gas price + small premium
      gasPrice: await provider.getGasPrice()
    });
    
    // Wait for confirmation
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }
    
    return receipt;
  } catch (error) {
    throw new Error(`Transaction execution failed: ${error.message}`);
  }
};
```

---

## 2.5.4 Error Handling and Monitoring

### API Error Responses

#### Standardized Error Format:
```typescript
interface APIError {
  error: string;           // Human-readable error message
  code?: string;          // Error code for programmatic handling
  timestamp: string;      // ISO timestamp
  requestId?: string;     // Unique request identifier
  details?: any;         // Additional error context
}
```

#### Error Response Examples:
```json
// Validation Error
{
  "error": "voter_id is required",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456789"
}

// Not Found Error
{
  "error": "Voter ID not found in KYC records",
  "code": "VOTER_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456790"
}

// System Error
{
  "error": "Merkle tree generation failed",
  "code": "INTERNAL_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_123456791",
  "details": {
    "service": "merkle-service",
    "retry_after": 300
  }
}
```

### Monitoring and Logging

#### API Monitoring:
```typescript
// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  req.requestId = requestId;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};
```

---

## 2.5.5 Deliverables Summary

### ✅ API Documentation
- **Complete Endpoint Specifications**: 2 RESTful endpoints with full documentation
- **Request/Response Examples**: Detailed JSON examples for all scenarios  
- **Error Handling**: Comprehensive error codes and recovery strategies
- **Authentication Flows**: Blockchain-based authentication mechanisms

### ✅ Integration Plan
- **4 Major Integration Points**: Blockchain, MetaMask, Backend APIs, Cross-platform
- **Security Protocols**: End-to-end security measures and best practices
- **Platform Support**: Web (React) and Mobile (React Native) implementations
- **Development & Production**: Environment-specific configurations

### 🔧 Technical Specifications
- **Backend**: Node.js/Express with TypeScript support
- **Frontend**: React with ethers.js for blockchain interaction
- **Mobile**: React Native with deep-link MetaMask integration  
- **Blockchain**: Ethereum smart contracts with Hardhat development environment
- **Security**: Commit-reveal voting, Merkle proofs, and wallet-based authentication

### 📊 API Coverage
- **RESTful Design**: GET endpoints with query parameters
- **JSON Responses**: Standardized response formats
- **CORS Support**: Cross-origin request handling
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

### 🔒 Security Framework
- **No Traditional Auth**: Blockchain wallet-based authentication
- **Vote Privacy**: Commit-reveal mechanism for secret balloting
- **Access Control**: Role-based permissions (Admin/Voter)
- **Data Protection**: Encryption and secure storage practices
- **API Security**: Rate limiting, input validation, and CORS protection

This comprehensive API and Integration Planning documentation provides the foundation for secure, scalable implementation of the BharatVote blockchain voting system across web and mobile platforms. 