const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256 } = require('ethers');

const PORT = process.env.PORT || 3001;

/**
 * Helper that matches the hashing strategy used in the smart contract.
 * Accepts either a checksummed address string (for leaves) or a Buffer
 * (for internal nodes) and always returns a Buffer.
 */
const keccak256Hasher = (data) => {
  if (typeof data === 'string') {
    return Buffer.from(
      solidityPackedKeccak256(['address'], [data.toLowerCase()]).slice(2),
      'hex'
    );
  }

  if (Buffer.isBuffer(data)) {
    return Buffer.from(keccak256(data).slice(2), 'hex');
  }

  throw new Error('Invalid data type passed to keccak256Hasher');
};

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

// Simple rate limiter so the mock API behaves like a public endpoint
app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

/**
 * Sanitize voter IDs – allows alphanumerics, hyphen, underscore only.
 */
const sanitizeVoterId = (id) =>
  typeof id === 'string' ? id.replace(/[\W-]/g, '').slice(0, 64) : '';

// Load voter KYC data (mock data lives alongside the server)
const kycData = require('./kyc-data.json');

// Load eligible voter addresses that generate the Merkle proof
const eligibleVoters = require('../../eligibleVoters.json');

// Prepare Merkle tree
const leaves = eligibleVoters.map((addr) =>
  keccak256Hasher(addr.toLowerCase())
);
const tree = new MerkleTree(leaves, keccak256Hasher, {
  sortLeaves: true,
  sortPairs: true,
});
const merkleRoot = tree.getRoot().toString('hex');
console.log('✅ Mock KYC server ready');
console.log('   Listening on port:', PORT);
console.log('   Eligible voters loaded:', eligibleVoters.length);
console.log('   Merkle root:', `0x${merkleRoot}`);

/**
 * GET /api/kyc?voter_id=VOTER1
 * Returns whether the voter is eligible and the wallet address they must use.
 */
app.get('/api/kyc', (req, res) => {
  const voterId = sanitizeVoterId(req.query.voter_id);

  if (!voterId) {
    return res
      .status(400)
      .json({ eligible: false, error: 'voter_id is required' });
  }

  const record = kycData.find((entry) => entry.voterId === voterId);

  if (!record) {
    return res.json({ eligible: false });
  }

  return res.json({ eligible: true, address: record.address });
});

/**
 * GET /api/merkle-proof?voter_id=VOTER1
 * Returns the Merkle proof for the voter's address.
 */
app.get('/api/merkle-proof', (req, res) => {
  const voterId = sanitizeVoterId(req.query.voter_id);

  if (!voterId) {
    return res.status(400).json({ error: 'voter_id is required' });
  }

  const kycRecord = kycData.find((entry) => entry.voterId === voterId);

  if (!kycRecord?.address) {
    return res.status(403).json({ error: 'Voter not found in KYC data' });
  }

  const hashedAddress = keccak256Hasher(kycRecord.address.toLowerCase());
  const proofElements = tree.getProof(hashedAddress);
  const proof = proofElements.map((item) => `0x${item.data.toString('hex')}`);
  const isEligible = tree.verify(proofElements, hashedAddress, tree.getRoot());

  if (!isEligible) {
    return res.status(403).json({ error: 'Voter not eligible' });
  }

  res.json({ proof, merkleRoot: `0x${merkleRoot}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock KYC server listening at http://localhost:${PORT}`);
});
