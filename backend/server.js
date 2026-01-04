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
const DEMO_ELECTION_ADDRESS =
  process.env.VITE_DEMO_ELECTION_ADDRESS ||
  process.env.DEMO_ELECTION_ADDRESS ||
  process.env.DEMO_ELECTION_CONTRACT ||
  '';

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

const NORMALIZED_PRIVATE_KEY =
  PRIVATE_KEY && typeof PRIVATE_KEY === 'string'
    ? (PRIVATE_KEY.trim().startsWith('0x') ? PRIVATE_KEY.trim() : `0x${PRIVATE_KEY.trim()}`)
    : null;

// --- 1. THE HYBRID LIST (Pros + Strangers) ---
// Start with known addresses. Strangers will be added here automatically.
const ADMIN_ADDRESS =
  process.env.ADMIN_ADDRESS ||
  (PRIVATE_KEY
    ? new ethers.Wallet(NORMALIZED_PRIVATE_KEY).address
    : null) ||
  '0xad9f935ba3c0b1ed22ef90e9cb6230b034383b5b';
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
const adminWallet = provider && NORMALIZED_PRIVATE_KEY ? new ethers.Wallet(NORMALIZED_PRIVATE_KEY, provider) : null;

// Merkle tree state
let tree = null;
let merkleRoot = null;

const rebuildTree = () => {
  const leaves = eligibleVoters.map((addr) => keccak256Hasher(addr));
  tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  merkleRoot = '0x' + tree.getRoot().toString('hex');
};

rebuildTree();

const DEMO_ELECTION_ABI = [
  'function merkleRoot() view returns (bytes32)',
  'function setMerkleRoot(bytes32 _root)',
  'function admin() view returns (address)',
];

async function syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged }) {
  if (!provider || !adminWallet) {
    console.log('?? Demo sync skipped (missing RPC_URL or PRIVATE_KEY).');
    return { synced: false, reason: 'missing_rpc_or_key' };
  }

  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) {
    console.log('?? Demo sync skipped (missing/invalid demo election address).');
    return { synced: false, reason: 'missing_demo_address' };
  }

  if (!merkleRoot || !ethers.isHexString(merkleRoot, 32)) {
    console.log('?? Demo sync skipped (invalid backend merkleRoot).');
    return { synced: false, reason: 'invalid_backend_root' };
  }

  const election = new ethers.Contract(DEMO_ELECTION_ADDRESS, DEMO_ELECTION_ABI, adminWallet);

  try {
    const onChainRoot = await election.merkleRoot();
    const shouldUpdate = String(onChainRoot).toLowerCase() !== String(merkleRoot).toLowerCase();

    if (onlyIfChanged && !shouldUpdate) {
      return { synced: false, reason: 'already_synced' };
    }

    if (!shouldUpdate) return { synced: false, reason: 'already_synced' };

    console.log(`?? Syncing demo election merkleRoot on-chain: ${DEMO_ELECTION_ADDRESS}`);
    const tx = await election.setMerkleRoot(merkleRoot);
    await tx.wait();
    console.log(`? Demo election merkleRoot synced. tx=${tx.hash}`);
    return { synced: true, txHash: tx.hash };
  } catch (error) {
    console.error('? Demo merkleRoot sync failed:', error);
    return { synced: false, reason: 'sync_failed', error: error?.message || String(error) };
  }
}

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
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) {
    return res.status(503).json({
      error: 'Demo is not configured on the backend (missing VITE_DEMO_ELECTION_ADDRESS)',
    });
  }

  const address = String(req.body?.address || '').trim();
  if (!ethers.isAddress(address)) return res.status(400).json({ error: 'No valid address provided' });

  const normalized = ethers.getAddress(address);
  console.log(`✨ New Demo Request: ${normalized}`);

  try {
    let listChanged = false;

    // A. Add to List (if they aren't already there)
    if (!eligibleVoters.some((v) => v.toLowerCase() === normalized.toLowerCase())) {
      eligibleVoters.push(normalized);
      rebuildTree();
      listChanged = true;
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

    // C. Keep the demo election usable: update on-chain merkleRoot when the backend list changes.
    const sync = listChanged
      ? await syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged: true })
      : { synced: false, reason: 'list_unchanged' };

    // If we changed the allowlist, the on-chain merkleRoot must be updated too or the voter will revert as NotEligible.
    if (listChanged && !sync?.synced) {
      return res.status(500).json({
        error:
          'Demo eligibility sync failed (cannot update on-chain merkleRoot). Check RPC_URL/PRIVATE_KEY and demo admin permissions.',
        merkleRoot,
        sync,
      });
    }

    return res.json({ success: true, message: 'Welcome to the demo!', merkleRoot, sync });
  } catch (error) {
    console.error('❌ Onboarding failed:', error);
    return res.status(500).json({ error: error?.message || 'Onboarding failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ready at http://localhost:${PORT}`);
});

module.exports = app;
