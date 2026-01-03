const path = require('path');

// Load env from repo root so `npm -C backend start` works.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Admin Private Key
const RPC_URL = process.env.VITE_SEPOLIA_RPC_URL || process.env.RPC_URL; // Alchemy/Infura URL

const keccak256Hasher = (data) => {
  if (typeof data === 'string') {
    // Leaf hashing must match contract: keccak256(abi.encodePacked(address))
    return Buffer.from(
      ethers.solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2),
      'hex'
    );
  }
  if (Buffer.isBuffer(data)) {
    // Internal node hashing: keccak256(concatBytes)
    return Buffer.from(ethers.keccak256(data).substring(2), 'hex');
  }
  throw new Error('Invalid data type for keccak256Hasher');
};

// --- 1. THE HYBRID LIST (Pros + Strangers) ---
// Start with known addresses. Strangers will be added here automatically.
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || '0xad9f935ba3c0b1ed22ef90e9cb6230b034383b5b';
const initialEligible = (() => {
  try {
    const fromFile = require('../eligibleVoters.json');
    return [ADMIN_ADDRESS, ...(Array.isArray(fromFile) ? fromFile : [])];
  } catch {
    return [ADMIN_ADDRESS];
  }
})();

const eligibleVoters = Array.from(
  new Set(
    initialEligible
      .filter(Boolean)
      .map((a) => String(a))
      .filter((a) => ethers.isAddress(a))
      .map((a) => ethers.getAddress(a)) // checksum + normalize
  )
);

// --- 2. SETUP BLOCKCHAIN CONNECTION ---
const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const adminWallet = provider && PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// Merkle tree state
let tree = null;
let merkleRoot = null;

const rebuildTree = () => {
  const leaves = eligibleVoters.map((addr) => keccak256Hasher(addr));
  tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  merkleRoot = '0x' + tree.getRoot().toString('hex');
};

rebuildTree();

console.log('------------------------------------------------');
console.log(`🌳 Server Started.`);
console.log(`👥 Whitelisted Voters: ${eligibleVoters.length}`);
console.log(`🌿 Merkle Root: ${merkleRoot}`);
console.log('------------------------------------------------');

// --- ENDPOINTS ---

// 1. Get Root (Frontend checks this against contract)
app.get('/api/merkle-root', (_req, res) => {
  // Return both keys for backward compatibility with older frontend code.
  res.json({ root: merkleRoot, merkleRoot });
});

// 2. Get Proof (Voter needs this to Commit)
app.get('/api/merkle-proof/:address', (req, res) => {
  const address = String(req.params.address || '').trim();
  if (!ethers.isAddress(address) || !tree) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const normalized = ethers.getAddress(address);
  const leaf = keccak256Hasher(normalized);
  const proofElements = tree.getProof(leaf);
  const ok = tree.verify(proofElements, leaf, tree.getRoot());
  if (!ok) return res.status(404).json({ error: 'Not eligible' });

  const proof = proofElements.map((x) => '0x' + x.data.toString('hex'));
  return res.json({ proof });
});

// 3. THE MAGIC "JOIN DEMO" ENDPOINT
app.post('/api/join', async (req, res) => {
  const address = String(req.body?.address || '').trim();
  if (!ethers.isAddress(address)) return res.status(400).json({ error: 'No valid address provided' });

  const normalized = ethers.getAddress(address);
  console.log(`✨ New Demo Request: ${normalized}`);

  try {
    // A. Add to List (if they aren't already there)
    if (!eligibleVoters.some((v) => v.toLowerCase() === normalized.toLowerCase())) {
      eligibleVoters.push(normalized);
      rebuildTree();
      console.log(`✅ User added! New Root: ${merkleRoot}`);
    } else {
      console.log('ℹ️ User already in list.');
    }

    // B. Fund them (if they are poor)
    if (provider && adminWallet) {
      const balance = await provider.getBalance(normalized);
      if (balance < ethers.parseEther('0.005')) {
        console.log('💸 User needs gas. Sending 0.01 ETH...');
        const tx = await adminWallet.sendTransaction({
          to: normalized,
          value: ethers.parseEther('0.01'),
        });
        await tx.wait();
        console.log('✅ User Funded!');
      }
    } else {
      console.log('ℹ️ Funding skipped (missing RPC_URL or PRIVATE_KEY).');
    }

    return res.json({ success: true, message: 'Welcome to the demo!', merkleRoot });
  } catch (error) {
    console.error('❌ Onboarding failed:', error);
    return res.status(500).json({ error: error?.message || 'Onboarding failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ready at http://localhost:${PORT}`);
});

module.exports = app;

