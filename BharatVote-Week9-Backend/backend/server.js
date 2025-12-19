const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256 } = require('ethers');

// This function will be passed to MerkleTree constructor as the hashing algorithm.
// It should receive Buffer inputs from MerkleTree's internal operations and return a Buffer.
// It also handles initial string addresses for leaf creation by passing them directly to keccak256.
const keccak256Hasher = (data) => {
    if (typeof data === 'string') {
        // For leaves (addresses), hash them using solidityPackedKeccak256 to match contract's abi.encodePacked
        return Buffer.from(solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
    } else if (Buffer.isBuffer(data)) {
        // For internal nodes, hash the concatenated buffer using keccak256
        return Buffer.from(keccak256(data).substring(2), 'hex');
    } else {
        throw new Error("Invalid data type for keccak256Hasher: Expected string or Buffer");
    }
};

const app = express();
const port = 3001;

// Simple in-memory caches with TTL to avoid recomputation and repeated KYC lookups
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const proofCache = new Map(); // voterId -> { proof, merkleRoot, expiresAt }
const kycCache = new Map();   // voterId -> { record, expiresAt }

const setCache = (map, key, value) => {
  map.set(key, { ...value, expiresAt: Date.now() + CACHE_TTL_MS });
};

const getCache = (map, key) => {
  const entry = map.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    map.delete(key);
    return null;
  }
  return entry;
};

app.use(cors());
app.use(express.json());
app.use(helmet());

// Basic rate limiting to protect public endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});
app.use('/api/', apiLimiter);

// Minimal input sanitizer for voter_id to alphanumerics/underscore only
const sanitizeVoterId = (id) => (typeof id === 'string' ? id.replace(/[^\w-]/g, '').slice(0, 64) : '');

// Load eligible voter addresses from shared JSON
const eligibleVoters = require("../eligibleVoters.json");
console.log('Loaded Eligible Voters:', eligibleVoters);

// Hash the eligible voter addresses to create leaves (Buffers) for the Merkle tree.
// Note: `toLowerCase()` is important here to canonicalize addresses before hashing.
const leaves = eligibleVoters.map(addr => {
    const hashedAddr = keccak256Hasher(addr.toLowerCase());
    console.log(`Leaf for ${addr}: ${hashedAddr.toString('hex')}`);
    return hashedAddr;
});
// console.log('Debug: Leaves (first):', leaves[0].toString('hex'), 'Type:', typeof leaves[0]);

// Create the MerkleTree with the prepared leaves and the internal hasher.
// IMPORTANT: sortLeaves and sortPairs must be true to match Solidity's canonical Merkle tree
const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });

// Log the Merkle Root (useful for contract verification)
const merkleRootHex = tree.getRoot().toString('hex');
console.log('Merkle Root:', merkleRootHex);
console.log('Debug: Merkle Root (Buffer):', tree.getRoot().toString('hex'), 'Type:', typeof tree.getRoot());

// ---------------------
// Mock KYC microservice
// ---------------------
const kycData = require("./kyc-data.json");
app.get('/api/kyc', (req, res) => {
  const voterId = sanitizeVoterId(req.query.voter_id);
  if (!voterId) {
    return res.status(400).json({ eligible: false, error: 'voter_id is required' });
  }

  const cached = getCache(kycCache, voterId);
  if (cached) {
    return res.json({ eligible: true, address: cached.record.address, cached: true });
  }

  const record = kycData.find(r => r.voterId === voterId);
  if (!record) {
    return res.json({ eligible: false });
  }
  // Successful KYC: return eligibility and expected Ethereum address
  setCache(kycCache, voterId, { record });
  return res.json({ eligible: true, address: record.address });
});
// ---------------------

app.get('/api/merkle-proof', (req, res) => {
    const voterId = sanitizeVoterId(req.query.voter_id);
    console.log(`Received Merkle proof request for voterId: ${voterId}`);

    if (!voterId) {
        return res.status(400).json({ error: 'voter_id is required' });
    }

  const cachedProof = getCache(proofCache, voterId);
  if (cachedProof) {
    return res.json(cachedProof.proofResponse);
  }

    // First, look up the voter ID in KYC data to get their Ethereum address
    const kycRecord = kycData.find(r => r.voterId === voterId);
    if (!kycRecord) {
        return res.status(403).json({ error: 'Voter ID not found in KYC records' });
    }

    const voterAddress = kycRecord.address;
    console.log('Found voter address for', voterId, ':', voterAddress);

    // Hash the voter's Ethereum address to match the leaf format (Buffer).
    // `toLowerCase()` is important here to canonicalize the address.
    const hashedAddress = keccak256Hasher(voterAddress.toLowerCase());
    console.log('Hashed voter address for proof generation:', hashedAddress.toString('hex'));

    const proofElements = tree.getProof(hashedAddress);
    console.log('Debug: Proof Elements (first):', proofElements[0]?.data.toString('hex'), 'Type:', typeof proofElements[0]?.data);

    // Convert proof elements to 0x-prefixed hex strings for the frontend/contract.
    const proof = proofElements.map(x => '0x' + x.data.toString('hex'));
    console.log('DEBUG: Backend sending proof:', proof);

    // Verify the proof internally for debugging.
    const isEligible = tree.verify(proofElements, hashedAddress, tree.getRoot());
    console.log('Is eligible:', isEligible);

    if (!isEligible) {
        return res.status(403).json({ error: 'Voter not eligible or proof invalid' });
    }

  const proofResponse = { proof };
  setCache(proofCache, voterId, { proofResponse });
  res.json(proofResponse);
});

// Expose Merkle root for clients/admins to set on-chain
app.get('/api/merkle-root', (_req, res) => {
    res.json({ merkleRoot: '0x' + merkleRootHex });
});

// Simple health endpoint for monitoring
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        merkleRoot: '0x' + merkleRootHex,
        cache: {
            proofEntries: proofCache.size,
            kycEntries: kycCache.size,
            ttlMs: CACHE_TTL_MS
        },
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});