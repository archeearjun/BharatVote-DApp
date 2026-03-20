const path = require('path');
const fs = require('fs');
const allowlistAuthSpec = require('../frontend/src/utils/allowlistAuthSpec.json');

// Load env from repo root so `npm -C backend start` works.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the deployed frontend by default, plus explicit configured origins.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://bharat-vote-d-app.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const rawCorsOrigin = String(process.env.CORS_ORIGIN || '').trim();
const allowAnyOrigin = rawCorsOrigin === '*' || (!rawCorsOrigin && process.env.NODE_ENV !== 'production');
const configuredOrigins = rawCorsOrigin
  ? rawCorsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];
const allowedOrigins = new Set(
  allowAnyOrigin
    ? []
    : (configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS).map((origin) => origin.toLowerCase())
);

const corsOptions = {
  origin(origin, callback) {
    if (allowAnyOrigin || !origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(String(origin).toLowerCase())) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// General rate limiter: 120 req / 1 min per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

// Stricter limiter for admin endpoints: 10 req / 1 min per IP
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests, please try again later.' },
});

const PORT = process.env.PORT || 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Admin Private Key
const RPC_URL = process.env.VITE_SEPOLIA_RPC_URL || process.env.RPC_URL; // Alchemy/Infura URL
const DEMO_ANALYTICS_RPC_URL = process.env.DEMO_ANALYTICS_RPC_URL || '';
const DEMO_ELECTION_ADDRESS =
  process.env.VITE_DEMO_ELECTION_ADDRESS ||
  process.env.DEMO_ELECTION_ADDRESS ||
  process.env.DEMO_ELECTION_CONTRACT ||
  '';

const DEMO_SYNC_WAIT_CONFIRMATIONS = (() => {
  // In serverless environments (e.g. Vercel), waiting for confirmations frequently exceeds function timeouts.
  const raw = process.env.DEMO_SYNC_WAIT_CONFIRMATIONS;
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return process.env.VERCEL ? 0 : 1;
  }
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
})();

const DEMO_PHASE_WAIT_CONFIRMATIONS = (() => {
  // Phase transitions can be run in a background loop; avoid hard waiting in environments that may suspend.
  const raw = process.env.DEMO_PHASE_WAIT_CONFIRMATIONS;
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return process.env.VERCEL ? 0 : 1;
  }
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
})();

const DEMO_TX_WAIT_TIMEOUT_MS = (() => {
  const raw = process.env.DEMO_TX_WAIT_TIMEOUT_MS;
  if (raw === undefined || raw === null || String(raw).trim() === '') return 30000;
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 30000;
})();

const DEMO_AUTOPHASE_ENABLED = String(process.env.DEMO_AUTOPHASE_ENABLED || '').toLowerCase() === 'true';
const DEMO_AUTORESET_ENABLED = String(process.env.DEMO_AUTORESET_ENABLED || 'true').toLowerCase() !== 'false';
const DEMO_START_MODE = String(process.env.DEMO_START_MODE || 'on_first_join'); // 'on_first_join' | 'immediate'
const DEMO_COMMIT_SECONDS = Number.parseInt(String(process.env.DEMO_COMMIT_SECONDS || '120'), 10);
const DEMO_REVEAL_SECONDS = Number.parseInt(String(process.env.DEMO_REVEAL_SECONDS || '120'), 10);
const DEMO_RESET_GRACE_SECONDS = Number.parseInt(String(process.env.DEMO_RESET_GRACE_SECONDS || '15'), 10);
const DEMO_POLL_INTERVAL_MS = Number.parseInt(String(process.env.DEMO_POLL_INTERVAL_MS || '5000'), 10);
const DEMO_ANALYTICS_ENABLED = String(process.env.DEMO_ANALYTICS_ENABLED || 'true').toLowerCase() !== 'false';
const DEMO_ANALYTICS_FROM_BLOCK = Number.parseInt(String(process.env.DEMO_ANALYTICS_FROM_BLOCK || '0'), 10);
const DEMO_ANALYTICS_BATCH_SIZE = Number.parseInt(String(process.env.DEMO_ANALYTICS_BATCH_SIZE || '2000'), 10);
const DEMO_ANALYTICS_MAX_REQUESTS = Number.parseInt(String(process.env.DEMO_ANALYTICS_MAX_REQUESTS || '3'), 10);
const DEMO_ANALYTICS_PATH = path.join(__dirname, 'demo-analytics.json');
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DEMO_ANALYTICS_STORAGE =
  process.env.DEMO_ANALYTICS_STORAGE ||
  (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN ? 'upstash' : 'file');
const ELIGIBLE_VOTERS_PATH = path.join(__dirname, '..', 'eligibleVoters.json');
const MAX_DEMO_ELIGIBLE_VOTERS = (() => {
  const parsed = Number.parseInt(String(process.env.MAX_DEMO_ELIGIBLE_VOTERS || '500'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
})();
const ADMIN_ALLOWLIST_SIGNATURE_TTL_MS = (() => {
  const parsed = Number.parseInt(String(process.env.ADMIN_ALLOWLIST_SIGNATURE_TTL_MS || '300000'), 10);
  return Number.isFinite(parsed) && parsed >= 10000 ? parsed : 300000;
})();
const ELECTION_ADMIN_ABI = ['function admin() view returns (address)'];
const ELECTION_READ_ABI = [
  'function admin() view returns (address)',
  'function merkleRoot() view returns (bytes32)',
  'function phase() view returns (uint8)',
];
const ZERO_HASH = ethers.ZeroHash.toLowerCase();

const sanitizeVoterId = (id) => (typeof id === 'string' ? id.replace(/[^\w-]/g, '').slice(0, 64) : '');
const hasUsableMerkleRoot = (root) =>
  typeof root === 'string' && ethers.isHexString(root, 32) && root.toLowerCase() !== ZERO_HASH;

const kycData = (() => {
  try {
    const data = require('./kyc-data.json');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
})();

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
    const raw = fs.readFileSync(ELIGIBLE_VOTERS_PATH, 'utf8');
    const fromFile = JSON.parse(raw);
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

// Serialise all eligible-voter file writes through a promise chain to prevent
// concurrent /api/join calls from corrupting the JSON file.
let _voterWriteChain = Promise.resolve();
const saveEligibleVoters = () => {
  _voterWriteChain = _voterWriteChain.then(() => {
    try {
      fs.writeFileSync(ELIGIBLE_VOTERS_PATH, JSON.stringify(eligibleVoters, null, 2));
    } catch (e) {
      console.warn('Failed to persist eligible voters file', e?.message || e);
    }
  });
  return _voterWriteChain;
};

// --- 2. SETUP BLOCKCHAIN CONNECTION ---
const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const analyticsProvider = DEMO_ANALYTICS_RPC_URL
  ? new ethers.JsonRpcProvider(DEMO_ANALYTICS_RPC_URL)
  : provider;
const baseAdminWallet =
  provider && NORMALIZED_PRIVATE_KEY ? new ethers.Wallet(NORMALIZED_PRIVATE_KEY, provider) : null;
const adminWallet = baseAdminWallet ? new ethers.NonceManager(baseAdminWallet) : null;

const TOPIC_VOTE_COMMITTED_V1 = ethers.id('VoteCommitted(address,bytes32)');
const TOPIC_VOTE_COMMITTED_V2 = ethers.id('VoteCommitted(address,bytes32,uint256)');
const TOPIC_VOTE_REVEALED_V1 = ethers.id('VoteRevealed(address,uint256)');
const TOPIC_VOTE_REVEALED_V2 = ethers.id('VoteRevealed(address,uint256,uint256)');
const TOPIC_VOTE_REVEALED_V1_UINT8 = ethers.id('VoteRevealed(address,uint8)');
const TOPIC_VOTE_REVEALED_V2_UINT8 = ethers.id('VoteRevealed(address,uint8,uint256)');
const ANALYTICS_REVEAL_TOPICS = new Set([
  TOPIC_VOTE_REVEALED_V1,
  TOPIC_VOTE_REVEALED_V2,
  TOPIC_VOTE_REVEALED_V1_UINT8,
  TOPIC_VOTE_REVEALED_V2_UINT8,
]);
const ANALYTICS_COMMIT_TOPICS = new Set([TOPIC_VOTE_COMMITTED_V1, TOPIC_VOTE_COMMITTED_V2]);

const abiCoder = new ethers.AbiCoder();

const demoAnalytics = {
  version: 1,
  electionAddress: DEMO_ELECTION_ADDRESS || null,
  committedCount: 0,
  revealedCount: 0,
  candidateVotes: {},
  lastProcessedBlock: null,
  updatedAtMs: null,
};

const upstashKeyForDemo = () => {
  if (!DEMO_ELECTION_ADDRESS) return 'bharatvote:demo:analytics';
  return `bharatvote:demo:${String(DEMO_ELECTION_ADDRESS).toLowerCase()}:analytics`;
};

const upstashGet = async (key) => {
  const url = `${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  return resp?.data?.result ?? null;
};

const upstashSet = async (key, value) => {
  const url = `${UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  try {
    await axios.post(url, null, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });
  } catch (e) {
    // Fallback: some setups allow GET for REST commands
    await axios.get(url, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });
  }
};

const loadDemoAnalytics = async () => {
  try {
    let raw = null;
    if (DEMO_ANALYTICS_STORAGE === 'upstash' && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
      raw = await upstashGet(upstashKeyForDemo());
    } else if (fs.existsSync(DEMO_ANALYTICS_PATH)) {
      raw = fs.readFileSync(DEMO_ANALYTICS_PATH, 'utf8');
    }
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.electionAddress && DEMO_ELECTION_ADDRESS && String(parsed.electionAddress).toLowerCase() !== String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
      return;
    }
    Object.assign(demoAnalytics, parsed);
  } catch (e) {
    console.warn('Demo analytics: failed to load persisted file', e?.message || e);
  }
};

const saveDemoAnalytics = async () => {
  try {
    const payload = JSON.stringify(demoAnalytics, null, 2);
    if (DEMO_ANALYTICS_STORAGE === 'upstash' && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
      await upstashSet(upstashKeyForDemo(), payload);
      return;
    }
    fs.writeFileSync(DEMO_ANALYTICS_PATH, payload);
  } catch (e) {
    console.warn('Demo analytics: failed to persist file', e?.message || e);
  }
};

const decodeChoiceFromLogData = (data) => {
  if (!data || data === '0x') return null;
  try {
    return Number(abiCoder.decode(['uint256'], data)[0]);
  } catch {}
  try {
    return Number(abiCoder.decode(['uint8'], data)[0]);
  } catch {}
  try {
    return Number(abiCoder.decode(['uint256', 'uint256'], data)[0]);
  } catch {}
  try {
    return Number(abiCoder.decode(['uint8', 'uint256'], data)[0]);
  } catch {}
  return null;
};

const parseLogRangeLimitFromError = (err) => {
  const message = String(err?.info?.error?.message || err?.error?.message || err?.message || '');
  const m = message.match(/block range should work:\s*\[\s*0x([0-9a-fA-F]+)\s*,\s*0x([0-9a-fA-F]+)\s*\]/i);
  if (m) {
    const from = Number.parseInt(m[1], 16);
    const to = Number.parseInt(m[2], 16);
    const blocks = Number.isFinite(from) && Number.isFinite(to) ? (to - from + 1) : NaN;
    return Number.isFinite(blocks) && blocks > 0 ? blocks : null;
  }
  const m2 = message.match(/up to a\s+(\d+)\s+block range/i);
  if (m2) {
    const blocks = Number(m2[1]);
    return Number.isFinite(blocks) && blocks > 0 ? blocks : null;
  }
  return null;
};

const scanDemoAnalyticsOnce = async () => {
  if (!DEMO_ANALYTICS_ENABLED) return;
  if (!analyticsProvider) return;
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) return;

  const latest = await analyticsProvider.getBlockNumber();
  let fromBlock =
    typeof demoAnalytics.lastProcessedBlock === 'number'
      ? demoAnalytics.lastProcessedBlock + 1
      : Math.max(0, Number.isFinite(DEMO_ANALYTICS_FROM_BLOCK) ? DEMO_ANALYTICS_FROM_BLOCK : 0);

  if (fromBlock > latest) return;

  let requests = 0;
  let batchSize = Math.max(1, DEMO_ANALYTICS_BATCH_SIZE);
  while (fromBlock <= latest && requests < Math.max(1, DEMO_ANALYTICS_MAX_REQUESTS)) {
    const toBlock = Math.min(latest, fromBlock + Math.max(0, batchSize - 1));
    let logs = [];
    try {
      logs = await analyticsProvider.getLogs({
        address: DEMO_ELECTION_ADDRESS,
        fromBlock,
        toBlock,
      });
      requests += 1;
    } catch (e) {
      const maxBlocks = parseLogRangeLimitFromError(e);
      if (maxBlocks && maxBlocks > 0 && maxBlocks < batchSize) {
        batchSize = maxBlocks;
        continue;
      }
      throw e;
    }

    for (const log of logs) {
      const topic0 = log?.topics?.[0];
      if (!topic0) continue;

      if (ANALYTICS_COMMIT_TOPICS.has(topic0)) {
        demoAnalytics.committedCount += 1;
        continue;
      }

      if (ANALYTICS_REVEAL_TOPICS.has(topic0)) {
        demoAnalytics.revealedCount += 1;
        const choice = decodeChoiceFromLogData(log.data);
        if (typeof choice === 'number' && Number.isFinite(choice)) {
          const key = String(choice);
          demoAnalytics.candidateVotes[key] = (demoAnalytics.candidateVotes[key] || 0) + 1;
        }
      }
    }

    demoAnalytics.lastProcessedBlock = toBlock;
    demoAnalytics.updatedAtMs = Date.now();
    demoAnalytics.electionAddress = DEMO_ELECTION_ADDRESS;
    fromBlock = toBlock + 1;
  }

  await saveDemoAnalytics();
};

loadDemoAnalytics().catch((e) => console.warn('Demo analytics: failed to initialize', e?.message || e));

// Merkle tree state
let tree = null;
let merkleRoot = null;

const rebuildTree = () => {
  const leaves = eligibleVoters.map((addr) => keccak256Hasher(addr));
  tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  merkleRoot = '0x' + tree.getRoot().toString('hex');
};

const removeDemoEligibleVoter = (address) => {
  const normalized = ethers.getAddress(address);
  const index = eligibleVoters.findIndex((entry) => String(entry).toLowerCase() === normalized.toLowerCase());
  if (index === -1) return false;
  eligibleVoters.splice(index, 1);
  rebuildTree();
  saveEligibleVoters();
  return true;
};

rebuildTree();

// --- 2.1 Admin-managed allowlists (per election) ---
const VOTER_LISTS_PATH = path.join(__dirname, 'voter-lists.json');
const electionAllowlists = {};
const electionTrees = new Map();

const normalizeAddressList = (raw) => {
  let list = [];
  if (Array.isArray(raw)) {
    list = raw.map((x) => String(x));
  } else if (typeof raw === 'string') {
    list = raw
      .split(/[\s,;]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return Array.from(
    new Set(
      list
        .filter((address) => ethers.isAddress(address))
        .map((address) => ethers.getAddress(address))
    )
  );
};

const buildElectionTree = (addresses) => {
  const leaves = addresses.map((addr) => keccak256Hasher(addr));
  const t = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  const root = '0x' + t.getRoot().toString('hex');
  return { tree: t, merkleRoot: root };
};

const hashAllowlistAddresses = (addresses) =>
  ethers.keccak256(ethers.toUtf8Bytes(normalizeAddressList(addresses).join('\n')));

const buildAllowlistUploadMessage = (electionAddress, addresses, issuedAt) => {
  const normalizedElectionAddress = ethers.getAddress(electionAddress);
  const addressesHash = hashAllowlistAddresses(addresses);

  return [
    allowlistAuthSpec.title,
    `${allowlistAuthSpec.fields.election}: ${normalizedElectionAddress}`,
    `${allowlistAuthSpec.fields.addressesHash}: ${addressesHash}`,
    `${allowlistAuthSpec.fields.issuedAt}: ${issuedAt}`,
  ].join('\n');
};

const verifyAllowlistUploadAuth = async ({ electionAddress, addresses, auth }) => {
  if (!provider) {
    return { ok: false, status: 503, error: 'RPC provider not configured for admin verification' };
  }

  const issuedAt = Number(auth?.issuedAt);
  const signature = typeof auth?.signature === 'string' ? auth.signature.trim() : '';

  if (!Number.isFinite(issuedAt) || !signature) {
    return { ok: false, status: 401, error: 'Missing admin signature' };
  }

  const serverNow = Date.now();
  // Reject future-dated tokens and tokens older than TTL; allow small backward skew only
  if (issuedAt > serverNow + 30_000 || serverNow - issuedAt > ADMIN_ALLOWLIST_SIGNATURE_TTL_MS) {
    return { ok: false, status: 401, error: 'Admin signature expired. Please sign again.' };
  }

  const normalizedAddresses = normalizeAddressList(addresses);
  const message = buildAllowlistUploadMessage(electionAddress, normalizedAddresses, issuedAt);

  let recoveredAddress;
  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch {
    return { ok: false, status: 401, error: 'Invalid admin signature' };
  }

  try {
    const electionRead = new ethers.Contract(electionAddress, ELECTION_ADMIN_ABI, provider);
    const onChainAdmin = await electionRead.admin();

    if (String(recoveredAddress).toLowerCase() !== String(onChainAdmin).toLowerCase()) {
      return { ok: false, status: 403, error: 'Signed wallet is not the election admin' };
    }

    return {
      ok: true,
      normalizedAddresses,
      recoveredAddress: ethers.getAddress(recoveredAddress),
    };
  } catch (e) {
    return {
      ok: false,
      status: 503,
      error: `Failed to verify election admin: ${e?.message || String(e)}`,
    };
  }
};

const saveElectionAllowlists = () => {
  try {
    fs.writeFileSync(VOTER_LISTS_PATH, JSON.stringify(electionAllowlists, null, 2));
  } catch (e) {
    console.warn('Failed to persist voter list file', e?.message || e);
  }
};

const loadElectionAllowlists = () => {
  try {
    if (!fs.existsSync(VOTER_LISTS_PATH)) return;
    const raw = fs.readFileSync(VOTER_LISTS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    Object.assign(electionAllowlists, parsed);
    Object.entries(electionAllowlists).forEach(([key, value]) => {
      const addresses = normalizeAddressList(value?.addresses || []);
      const { tree: t, merkleRoot: root } = buildElectionTree(addresses);
      electionTrees.set(key, t);
      electionAllowlists[key] = { addresses, merkleRoot: root };
    });
  } catch (e) {
    console.warn('Failed to load voter list file', e?.message || e);
  }
};

const setElectionAllowlist = (electionAddress, addresses) => {
  const key = String(electionAddress).toLowerCase();
  const normalized = normalizeAddressList(addresses);
  const { tree: t, merkleRoot: root } = buildElectionTree(normalized);
  electionAllowlists[key] = { addresses: normalized, merkleRoot: root };
  electionTrees.set(key, t);
  saveElectionAllowlists();
  return { count: normalized.length, merkleRoot: root };
};

const getElectionAllowlist = (electionAddress) => {
  if (!electionAddress) return null;
  const key = String(electionAddress).toLowerCase();
  return electionAllowlists[key] || null;
};

const getElectionTree = (electionAddress) => {
  if (!electionAddress) return null;
  const key = String(electionAddress).toLowerCase();
  return electionTrees.get(key) || null;
};

const readElectionState = async (electionAddress) => {
  if (!provider) {
    throw new Error('RPC provider not configured for election state reads');
  }

  const electionRead = new ethers.Contract(electionAddress, ELECTION_READ_ABI, provider);
  const [admin, merkleRootOnChain, phase] = await Promise.all([
    electionRead.admin(),
    electionRead.merkleRoot(),
    electionRead.phase(),
  ]);

  return {
    admin: ethers.getAddress(admin),
    merkleRoot: String(merkleRootOnChain),
    phase: Number(phase),
  };
};

loadElectionAllowlists();

const DEMO_ELECTION_ABI = [
  // Custom errors (helps decode/label revert reasons in automation logs)
  'error NotAdmin()',
  'error WrongPhase()',
  'error CanOnlyResetAfterFinish()',
  'function merkleRoot() view returns (bytes32)',
  'function setMerkleRoot(bytes32 _root)',
  'function admin() view returns (address)',
  'function phase() view returns (uint8)',
  'function startReveal()',
  'function finishElection()',
  'function resetElection()',
];

const DEMO_ELECTION_IFACE = new ethers.Interface(DEMO_ELECTION_ABI);

async function syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged }) {
  if (syncDemoElectionMerkleRootIfConfigured.inFlight) {
    return syncDemoElectionMerkleRootIfConfigured.inFlight;
  }

  syncDemoElectionMerkleRootIfConfigured.inFlight = (async () => {
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
    if (DEMO_SYNC_WAIT_CONFIRMATIONS > 0) {
      await tx.wait(DEMO_SYNC_WAIT_CONFIRMATIONS);
      console.log(`? Demo election merkleRoot synced. tx=${tx.hash}`);
      return { synced: true, txHash: tx.hash, confirmationsWaited: DEMO_SYNC_WAIT_CONFIRMATIONS };
    }
    console.log(`? Demo election merkleRoot sync submitted (not awaited). tx=${tx.hash}`);
    return { synced: true, txHash: tx.hash, confirmationsWaited: 0, pending: true };
  } catch (error) {
    console.error('? Demo merkleRoot sync failed:', error);
    return { synced: false, reason: 'sync_failed', error: error?.message || String(error) };
  }
  })();

  try {
    return await syncDemoElectionMerkleRootIfConfigured.inFlight;
  } finally {
    syncDemoElectionMerkleRootIfConfigured.inFlight = null;
  }
}

// --- 3. DEMO "ROBOT ADMIN" SCHEDULER (DEMO ELECTION ONLY) ---
const demoState = {
  enabled: DEMO_AUTOPHASE_ENABLED,
  reasonDisabled: null,
  address: DEMO_ELECTION_ADDRESS,
  adminOk: false,
  roundId: 0,
  lastObservedPhase: null,
  roundStartedAtMs: null,
  commitEndsAtMs: null,
  revealEndsAtMs: null,
  finishedAtMs: null,
  resetAtMs: null,
  lastTransitionTx: null,
  lastTransitionAtMs: null,
  lastAttemptAtMs: null,
  lastError: null,
  lastErrorAtMs: null,
  lastErrorPhase: null,
  transitioning: false,
};
const DEMO_STATE_PATH = path.join(__dirname, 'demo-state.json');

const persistDemoState = () => {
  try {
    fs.writeFileSync(
      DEMO_STATE_PATH,
      JSON.stringify(
        {
          roundId: demoState.roundId,
          lastObservedPhase: demoState.lastObservedPhase,
          roundStartedAtMs: demoState.roundStartedAtMs,
          commitEndsAtMs: demoState.commitEndsAtMs,
          revealEndsAtMs: demoState.revealEndsAtMs,
          finishedAtMs: demoState.finishedAtMs,
          resetAtMs: demoState.resetAtMs,
          lastTransitionTx: demoState.lastTransitionTx,
          lastTransitionAtMs: demoState.lastTransitionAtMs,
          lastAttemptAtMs: demoState.lastAttemptAtMs,
          lastError: demoState.lastError,
          lastErrorAtMs: demoState.lastErrorAtMs,
          lastErrorPhase: demoState.lastErrorPhase,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.warn('Failed to persist demo state file', e?.message || e);
  }
};

const loadDemoState = () => {
  try {
    if (!fs.existsSync(DEMO_STATE_PATH)) return;
    const parsed = JSON.parse(fs.readFileSync(DEMO_STATE_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object') return;

    demoState.roundId = Number.isFinite(parsed.roundId) ? parsed.roundId : demoState.roundId;
    demoState.lastObservedPhase = Number.isFinite(parsed.lastObservedPhase) ? parsed.lastObservedPhase : demoState.lastObservedPhase;
    demoState.roundStartedAtMs = Number.isFinite(parsed.roundStartedAtMs) ? parsed.roundStartedAtMs : demoState.roundStartedAtMs;
    demoState.commitEndsAtMs = Number.isFinite(parsed.commitEndsAtMs) ? parsed.commitEndsAtMs : demoState.commitEndsAtMs;
    demoState.revealEndsAtMs = Number.isFinite(parsed.revealEndsAtMs) ? parsed.revealEndsAtMs : demoState.revealEndsAtMs;
    demoState.finishedAtMs = Number.isFinite(parsed.finishedAtMs) ? parsed.finishedAtMs : demoState.finishedAtMs;
    demoState.resetAtMs = Number.isFinite(parsed.resetAtMs) ? parsed.resetAtMs : demoState.resetAtMs;
    demoState.lastTransitionTx = typeof parsed.lastTransitionTx === 'string' ? parsed.lastTransitionTx : demoState.lastTransitionTx;
    demoState.lastTransitionAtMs = Number.isFinite(parsed.lastTransitionAtMs) ? parsed.lastTransitionAtMs : demoState.lastTransitionAtMs;
    demoState.lastAttemptAtMs = Number.isFinite(parsed.lastAttemptAtMs) ? parsed.lastAttemptAtMs : demoState.lastAttemptAtMs;
    demoState.lastError = typeof parsed.lastError === 'string' ? parsed.lastError : demoState.lastError;
    demoState.lastErrorAtMs = Number.isFinite(parsed.lastErrorAtMs) ? parsed.lastErrorAtMs : demoState.lastErrorAtMs;
    demoState.lastErrorPhase = Number.isFinite(parsed.lastErrorPhase) ? parsed.lastErrorPhase : demoState.lastErrorPhase;
  } catch (e) {
    console.warn('Failed to load demo state file', e?.message || e);
  }
};

loadDemoState();

function nowMs() {
  return Date.now();
}

function isPositiveInt(n) {
  return Number.isFinite(n) && n > 0;
}

function extractRevertData(err) {
  const candidates = [
    err?.data,
    err?.error?.data,
    err?.info?.error?.data,
    err?.info?.error?.data?.data,
    err?.info?.data,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.startsWith('0x') && value.length >= 10) return value;
  }

  return null;
}

function formatDemoAutomationError({ action, err }) {
  const code = err?.code ? String(err.code) : null;
  const revertData = extractRevertData(err);

  let parsedError = null;
  if (revertData) {
    try {
      parsedError = DEMO_ELECTION_IFACE.parseError(revertData);
    } catch {
      parsedError = null;
    }
  }

  const parsedName = parsedError?.name ? String(parsedError.name) : null;
  const base =
    parsedName ||
    (err?.shortMessage ? String(err.shortMessage) : null) ||
    (err?.message ? String(err.message) : String(err));

  const cleaned = base
    // Ethers error messages often include giant `receipt={...}` payloads; strip them for UI.
    .replace(/,\s*receipt=\{[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const prefix = action ? `${action}: ` : '';
  const suffix = code ? ` (${code})` : '';
  const max = 260;
  const msg = `${prefix}${cleaned}${suffix}`;
  return msg.length > max ? `${msg.slice(0, max)}…` : msg;
}

function ensureDemoSchedule(phase) {
  const current = nowMs();

  const commitSeconds = isPositiveInt(DEMO_COMMIT_SECONDS) ? DEMO_COMMIT_SECONDS : 120;
  const revealSeconds = isPositiveInt(DEMO_REVEAL_SECONDS) ? DEMO_REVEAL_SECONDS : 120;
  const resetGraceSeconds = isPositiveInt(DEMO_RESET_GRACE_SECONDS) ? DEMO_RESET_GRACE_SECONDS : 15;

  if (phase === 0) {
    if (!demoState.roundStartedAtMs) demoState.roundStartedAtMs = current;
    if (!demoState.commitEndsAtMs) demoState.commitEndsAtMs = demoState.roundStartedAtMs + commitSeconds * 1000;
    demoState.revealEndsAtMs = demoState.commitEndsAtMs + revealSeconds * 1000;
    demoState.finishedAtMs = null;
  } else if (phase === 1) {
    if (!demoState.roundStartedAtMs) demoState.roundStartedAtMs = current - commitSeconds * 1000;
    if (!demoState.commitEndsAtMs) demoState.commitEndsAtMs = demoState.roundStartedAtMs + commitSeconds * 1000;
    if (!demoState.revealEndsAtMs) demoState.revealEndsAtMs = current + revealSeconds * 1000;
    demoState.finishedAtMs = null;
  } else if (phase === 2) {
    if (!demoState.finishedAtMs) demoState.finishedAtMs = current;
    demoState.roundStartedAtMs = demoState.roundStartedAtMs || current;
    demoState.commitEndsAtMs = demoState.commitEndsAtMs || current;
    demoState.revealEndsAtMs = demoState.revealEndsAtMs || current;
    // Reset target is implicit: finished + grace
    demoState.resetAtMs = demoState.finishedAtMs + resetGraceSeconds * 1000;
  }

  persistDemoState();
}

function demoStatusPayload(extra) {
  const current = nowMs();
  const phase = extra?.phase ?? null;
  const nextPhaseAtMs =
    phase === 0 ? demoState.commitEndsAtMs : phase === 1 ? demoState.revealEndsAtMs : demoState.resetAtMs || null;

  const timeRemainingMs =
    typeof nextPhaseAtMs === 'number' ? Math.max(0, nextPhaseAtMs - current) : null;

  return {
    enabled: Boolean(demoState.enabled),
    reasonDisabled: demoState.reasonDisabled,
    demoElectionAddress: demoState.address || null,
    adminOk: Boolean(demoState.adminOk),
    roundId: demoState.roundId,
    phase,
    nowMs: current,
    roundStartedAtMs: demoState.roundStartedAtMs,
    commitEndsAtMs: demoState.commitEndsAtMs,
    revealEndsAtMs: demoState.revealEndsAtMs,
    finishedAtMs: demoState.finishedAtMs,
    nextPhaseAtMs,
    timeRemainingMs,
    lastTransitionTx: demoState.lastTransitionTx,
    lastTransitionAtMs: demoState.lastTransitionAtMs,
    lastAttemptAtMs: demoState.lastAttemptAtMs,
    lastError: demoState.lastError,
    lastErrorAtMs: demoState.lastErrorAtMs,
    transitioning: Boolean(demoState.transitioning),
  };
}

let demoJoinQueue = Promise.resolve();

function withDemoJoinLock(work) {
  const run = demoJoinQueue.then(() => work(), () => work());
  demoJoinQueue = run.then(() => undefined, () => undefined);
  return run;
}

async function waitForTx(tx) {
  if (!tx) return;
  if (DEMO_PHASE_WAIT_CONFIRMATIONS <= 0) return;
  await Promise.race([
    tx.wait(DEMO_PHASE_WAIT_CONFIRMATIONS),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`tx_wait_timeout_${DEMO_TX_WAIT_TIMEOUT_MS}ms`)), DEMO_TX_WAIT_TIMEOUT_MS)
    ),
  ]);
}

async function getDemoContract() {
  if (!provider || !adminWallet) return null;
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) return null;
  return new ethers.Contract(DEMO_ELECTION_ADDRESS, DEMO_ELECTION_ABI, adminWallet);
}

async function initDemoAutomation() {
  if (!demoState.enabled) return;

  if (!provider || !adminWallet) {
    demoState.enabled = false;
    demoState.reasonDisabled = 'missing_rpc_or_key';
    return;
  }

  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) {
    demoState.enabled = false;
    demoState.reasonDisabled = 'missing_demo_address';
    return;
  }

  if (!isPositiveInt(DEMO_COMMIT_SECONDS) || !isPositiveInt(DEMO_REVEAL_SECONDS)) {
    demoState.enabled = false;
    demoState.reasonDisabled = 'invalid_durations';
    return;
  }

  const contract = await getDemoContract();
  if (!contract) {
    demoState.enabled = false;
    demoState.reasonDisabled = 'missing_contract';
    return;
  }

  try {
    const [onChainAdmin, walletAddr] = await Promise.all([contract.admin(), adminWallet.getAddress()]);
    demoState.adminOk = String(onChainAdmin).toLowerCase() === String(walletAddr).toLowerCase();
    if (!demoState.adminOk) {
      demoState.enabled = false;
      demoState.reasonDisabled = 'wallet_not_demo_admin';
      return;
    }
  } catch (e) {
    demoState.enabled = false;
    demoState.reasonDisabled = 'admin_check_failed';
    return;
  }

  // Initialize schedule based on current phase unless we are waiting for first join.
  try {
    const phase = Number(await contract.phase());
    if (DEMO_START_MODE === 'immediate') {
      ensureDemoSchedule(phase);
    }
  } catch {
    // ignore; scheduler loop will try again
  }
}

async function runDemoSchedulerOnce() {
  if (!demoState.enabled) return;
  if (demoState.transitioning) return;

  const contract = await getDemoContract();
  if (!contract) return;

  try {
    const phase = Number(await contract.phase());
    demoState.lastObservedPhase = phase;

    // If configured to start only when first user joins, do not schedule until we have roundStartedAtMs.
    if (DEMO_START_MODE === 'on_first_join' && !demoState.roundStartedAtMs && phase === 0) {
      return;
    }

    ensureDemoSchedule(phase);
    const current = nowMs();

    const shouldStartReveal = phase === 0 && typeof demoState.commitEndsAtMs === 'number' && current >= demoState.commitEndsAtMs;
    const shouldFinish = phase === 1 && typeof demoState.revealEndsAtMs === 'number' && current >= demoState.revealEndsAtMs;
    const shouldReset = DEMO_AUTORESET_ENABLED && phase === 2 && typeof demoState.resetAtMs === 'number' && current >= demoState.resetAtMs;

    if (!shouldStartReveal && !shouldFinish && !shouldReset) return;

    demoState.transitioning = true;
    demoState.lastAttemptAtMs = nowMs();
    demoState.lastError = null;
    demoState.lastErrorAtMs = null;
    demoState.lastErrorPhase = null;

    const action = shouldStartReveal ? 'startReveal' : shouldFinish ? 'finishElection' : 'resetElection';

    // Avoid paying gas for predictable failures. This also gives us useful revert data for custom errors.
    try {
      await contract[action].staticCall();
    } catch (err) {
      const formatted = formatDemoAutomationError({ action, err });
      demoState.lastError = formatted;
      demoState.lastErrorAtMs = nowMs();
      demoState.lastErrorPhase = phase;
      persistDemoState();

      // If the configured wallet is no longer admin, disable autophasing to stop noisy retries.
      if (/\bNotAdmin\b/.test(formatted)) {
        demoState.enabled = false;
        demoState.reasonDisabled = 'wallet_not_demo_admin';
      }

      return;
    }

    if (shouldStartReveal) {
      const tx = await contract.startReveal();
      await waitForTx(tx);
      demoState.lastTransitionTx = tx.hash;
      demoState.lastTransitionAtMs = nowMs();
      demoState.finishedAtMs = null;
      persistDemoState();
    } else if (shouldFinish) {
      const tx = await contract.finishElection();
      await waitForTx(tx);
      demoState.lastTransitionTx = tx.hash;
      demoState.lastTransitionAtMs = nowMs();
      demoState.finishedAtMs = nowMs();
      persistDemoState();
    } else if (shouldReset) {
      const tx = await contract.resetElection();
      await waitForTx(tx);
      demoState.lastTransitionTx = tx.hash;
      demoState.lastTransitionAtMs = nowMs();
      demoState.roundId += 1;
      demoState.roundStartedAtMs = nowMs();
      demoState.commitEndsAtMs = null;
      demoState.revealEndsAtMs = null;
      demoState.finishedAtMs = null;
      demoState.resetAtMs = null;
      ensureDemoSchedule(0);
      persistDemoState();
    }
  } catch (e) {
    console.error('? Demo scheduler tick failed:', e);
    demoState.lastError = formatDemoAutomationError({ action: null, err: e });
    demoState.lastErrorAtMs = nowMs();
    demoState.lastErrorPhase = demoState.lastObservedPhase;
    persistDemoState();
  } finally {
    demoState.transitioning = false;
  }
}

console.log('------------------------------------------------');
console.log(`🌳 Server Started.`);
console.log(`👥 Whitelisted Voters: ${eligibleVoters.length}`);
console.log(`🌿 Merkle Root: ${merkleRoot}`);
console.log('------------------------------------------------');

// --- ENDPOINTS ---

// 0. Mock KYC (main elections)
app.get('/api/kyc', (req, res) => {
  const voterId = sanitizeVoterId(req.query?.voter_id);
  const electionAddress = req.query?.electionAddress ? String(req.query.electionAddress).trim() : '';
  const address = req.query?.address ? String(req.query.address).trim() : '';

  if (electionAddress) {
    if (!ethers.isAddress(electionAddress)) {
      return res.status(400).json({ eligible: false, error: 'Invalid election address' });
    }
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ eligible: false, error: 'Valid wallet address is required' });
    }

    // Demo elections skip KYC in the frontend, but guard anyway.
    if (DEMO_ELECTION_ADDRESS && String(electionAddress).toLowerCase() === String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
      return res.json({ eligible: true, address: ethers.getAddress(address), voterId });
    }

    const allowlist = getElectionAllowlist(electionAddress);
    if (!allowlist || !Array.isArray(allowlist.addresses)) {
      return res.status(404).json({
        eligible: false,
        error: 'This election is not ready yet. The admin must upload the voter list before voter verification can begin.',
      });
    }

    const normalized = ethers.getAddress(address);
    const isEligible = allowlist.addresses.some(
      (entry) => String(entry).toLowerCase() === normalized.toLowerCase()
    );

    if (!isEligible) {
      return res.json({
        eligible: false,
        error: 'This wallet is not in the uploaded voter list for this election.',
      });
    }

    return res.json({
      eligible: true,
      address: normalized,
      voterId: voterId || normalized,
      verificationMode: 'wallet_allowlist',
    });
  }

  if (!voterId) {
    return res.status(400).json({ eligible: false, error: 'voter_id is required' });
  }

  // Fallback to static mock data when no election context is provided.
  const record = kycData.find((r) => String(r?.voterId || '').toUpperCase() === voterId.toUpperCase());
  if (!record) {
    return res.json({ eligible: false });
  }

  return res.json({ eligible: true, address: record.address, voterId });
});

// 1. Get Root (Frontend checks this against contract)
app.get('/api/merkle-root', async (req, res) => {
  const electionAddress = req.query?.electionAddress ? String(req.query.electionAddress).trim() : '';
  if (electionAddress) {
    if (!ethers.isAddress(electionAddress)) {
      return res.status(400).json({ error: 'Invalid election address' });
    }

    if (DEMO_ELECTION_ADDRESS && String(electionAddress).toLowerCase() === String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
      return res.json({ root: merkleRoot, merkleRoot, electionAddress: ethers.getAddress(electionAddress) });
    }

    const allowlist = getElectionAllowlist(electionAddress);
    if (!allowlist?.merkleRoot) {
      return res.status(404).json({ error: 'No allowlist uploaded for this election' });
    }

    const response = {
      root: allowlist.merkleRoot,
      merkleRoot: allowlist.merkleRoot,
      electionAddress: ethers.getAddress(electionAddress),
      count: allowlist.addresses?.length || 0,
    };

    try {
      const state = await readElectionState(electionAddress);
      return res.json({
        ...response,
        onChainMerkleRoot: state.merkleRoot,
        phase: state.phase,
        rootsAligned:
          hasUsableMerkleRoot(state.merkleRoot) &&
          state.merkleRoot.toLowerCase() === String(allowlist.merkleRoot).toLowerCase(),
      });
    } catch {
      return res.json(response);
    }
  }

  // Backward-compatible demo root fallback.
  res.json({ root: merkleRoot, merkleRoot });
});

// 2. Get Proof (Voter needs this to Commit)
app.get('/api/merkle-proof/:address', (req, res) => {
  const address = String(req.params.address || '').trim();
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const electionAddress = req.query?.electionAddress ? String(req.query.electionAddress).trim() : '';
  let activeTree = tree;
  let isDemoTarget = true;

  if (electionAddress) {
    if (!ethers.isAddress(electionAddress)) {
      return res.status(400).json({ error: 'Invalid election address' });
    }
    if (DEMO_ELECTION_ADDRESS && String(electionAddress).toLowerCase() === String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
      activeTree = tree;
      isDemoTarget = true;
    } else {
      activeTree = getElectionTree(electionAddress);
      isDemoTarget = false;
      if (!activeTree) {
        return res.status(404).json({ error: 'No allowlist uploaded for this election' });
      }
    }
  }

  if (!activeTree) {
    return res.status(400).json({ error: 'Merkle tree not configured' });
  }

  const normalized = ethers.getAddress(address);

  // Keep the public demo usable: if the backend allowlist changed, ensure the demo contract merkleRoot is synced.
  if (isDemoTarget) {
    syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged: true }).catch(() => {});
  }

  const leaf = keccak256Hasher(normalized);
  const proofElements = activeTree.getProof(leaf);
  const ok = activeTree.verify(proofElements, leaf, activeTree.getRoot());
  if (!ok) return res.status(404).json({ error: 'Not eligible' });

  const proof = proofElements.map((x) => '0x' + x.data.toString('hex'));
  return res.json({ proof });
});

// 2.2 Admin allowlist upload (main elections) — strict rate limit
app.post('/api/admin/voter-list', adminLimiter, (req, res) => {
  const electionAddress = String(req.body?.electionAddress || '').trim();
  if (!electionAddress || !ethers.isAddress(electionAddress)) {
    return res.status(400).json({ error: 'Valid electionAddress is required' });
  }

  if (DEMO_ELECTION_ADDRESS && String(electionAddress).toLowerCase() === String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
    return res.status(400).json({ error: 'Demo election allowlist is managed automatically' });
  }

  const addresses = req.body?.addresses;
  const auth = req.body?.auth;

  verifyAllowlistUploadAuth({ electionAddress, addresses, auth })
    .then(async (verification) => {
      if (!verification.ok) {
        return res.status(verification.status).json({ error: verification.error });
      }

      const nextAllowlist = buildElectionTree(verification.normalizedAddresses);
      const state = await readElectionState(electionAddress);

      if (state.phase !== 0) {
        return res.status(409).json({
          error: 'The voter list can only be changed during the commit phase before the active on-chain root is finalized.',
          phase: state.phase,
        });
      }

      if (
        hasUsableMerkleRoot(state.merkleRoot) &&
        state.merkleRoot.toLowerCase() !== nextAllowlist.merkleRoot.toLowerCase()
      ) {
        return res.status(409).json({
          error: 'This election already has an active on-chain eligibility root for the current round. Start a new round before replacing the voter list.',
          currentMerkleRoot: state.merkleRoot,
          nextMerkleRoot: nextAllowlist.merkleRoot,
        });
      }

      const { count, merkleRoot: root } = setElectionAllowlist(
        electionAddress,
        verification.normalizedAddresses
      );

      return res.json({
        success: true,
        electionAddress: ethers.getAddress(electionAddress),
        count,
        merkleRoot: root,
        updatedBy: verification.recoveredAddress,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error?.message || 'Allowlist upload failed' });
    });
});

// 2.3 Admin allowlist summary
app.get('/api/admin/voter-list/:electionAddress', async (req, res) => {
  const electionAddress = String(req.params?.electionAddress || '').trim();
  if (!electionAddress || !ethers.isAddress(electionAddress)) {
    return res.status(400).json({ error: 'Valid electionAddress is required' });
  }

  const allowlist = getElectionAllowlist(electionAddress);
  if (!allowlist) {
    return res.status(404).json({ error: 'No allowlist uploaded for this election' });
  }

  const response = {
    electionAddress: ethers.getAddress(electionAddress),
    count: allowlist.addresses?.length || 0,
    merkleRoot: allowlist.merkleRoot,
  };

  try {
    const state = await readElectionState(electionAddress);
    return res.json({
      ...response,
      onChainMerkleRoot: state.merkleRoot,
      phase: state.phase,
      rootsAligned:
        hasUsableMerkleRoot(state.merkleRoot) &&
        state.merkleRoot.toLowerCase() === String(allowlist.merkleRoot).toLowerCase(),
    });
  } catch {
    return res.json(response);
  }
});

// 2.5 Demo status (timer + current phase). Safe for public access.
app.get('/api/demo/status', async (_req, res) => {
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) {
    return res.status(503).json({ error: 'Demo is not configured on the backend (missing VITE_DEMO_ELECTION_ADDRESS)' });
  }

  let phase = null;
  if (provider && adminWallet) {
    try {
      const contract = await getDemoContract();
      if (contract) phase = Number(await contract.phase());
      if (phase !== null) ensureDemoSchedule(phase);

      // If the on-chain phase changed (e.g., manual admin action), clear any stale error message.
      if (typeof phase === 'number' && typeof demoState.lastErrorPhase === 'number' && phase !== demoState.lastErrorPhase) {
        demoState.lastError = null;
        demoState.lastErrorAtMs = null;
        demoState.lastErrorPhase = null;
      }
    } catch {
      // ignore
    }
  }

  return res.json(demoStatusPayload({ phase }));
});

// 2.7 Demo analytics (all-time counts for demo election)
app.get('/api/demo/analytics', async (_req, res) => {
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) {
    return res.status(503).json({ error: 'Demo is not configured on the backend (missing VITE_DEMO_ELECTION_ADDRESS)' });
  }

  if (!DEMO_ANALYTICS_ENABLED) {
    return res.status(503).json({ error: 'Demo analytics disabled' });
  }

  try {
    await scanDemoAnalyticsOnce();
  } catch (e) {
    console.warn('Demo analytics scan failed', e?.message || e);
  }

  return res.json({
    ...demoAnalytics,
    source: 'backend',
    latestKnownBlock: analyticsProvider ? await analyticsProvider.getBlockNumber() : null,
  });
});

// 2.6 Demo tick: triggers one scheduler check (helps wake a cold backend).
app.post('/api/demo/tick', async (_req, res) => {
  if (!demoState.enabled) {
    return res.status(400).json(demoStatusPayload({ phase: null }));
  }
  await runDemoSchedulerOnce();
  let phase = null;
  try {
    const contract = await getDemoContract();
    if (contract) phase = Number(await contract.phase());
  } catch {}
  return res.json(demoStatusPayload({ phase }));
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

  return withDemoJoinLock(async () => {
    let listChanged = false;
    let sync = { synced: false, reason: 'list_unchanged' };
    let funding = { attempted: false, sent: false, skipped: true, reason: 'not_needed', txHash: null, error: null };

    try {
      const alreadyEligible = eligibleVoters.some((v) => v.toLowerCase() === normalized.toLowerCase());
      if (!alreadyEligible) {
        if (eligibleVoters.length >= MAX_DEMO_ELIGIBLE_VOTERS) {
          return res.status(429).json({
            error: 'Demo join limit reached. Please ask the admin to reset the demo allowlist.',
            limit: MAX_DEMO_ELIGIBLE_VOTERS,
          });
        }

        if (!provider || !adminWallet) {
          return res.status(503).json({
            error:
              'Public demo join is not enabled on this backend (missing RPC_URL/PRIVATE_KEY for on-chain merkleRoot sync).',
            reason: 'missing_rpc_or_key',
          });
        }

        try {
          const electionRead = new ethers.Contract(DEMO_ELECTION_ADDRESS, DEMO_ELECTION_ABI, provider);
          const [onChainAdmin, walletAddr] = await Promise.all([electionRead.admin(), adminWallet.getAddress()]);
          if (String(onChainAdmin).toLowerCase() !== String(walletAddr).toLowerCase()) {
            return res.status(503).json({
              error: 'Public demo join is not enabled on this backend (configured PRIVATE_KEY is not the demo admin).',
              reason: 'wallet_not_demo_admin',
              expectedAdmin: onChainAdmin,
              configuredWallet: walletAddr,
            });
          }
        } catch (e) {
          return res.status(503).json({
            error: 'Public demo join is temporarily unavailable (failed to verify demo admin permissions).',
            reason: 'admin_check_failed',
            details: e?.message || String(e),
          });
        }

        eligibleVoters.push(normalized);
        rebuildTree();
        saveEligibleVoters();
        listChanged = true;
        console.log(`✅ User added! New Root: ${merkleRoot}`);
      } else {
        console.log('ℹ️ User already in list.');
      }

      if (provider && adminWallet) {
        sync = await syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged: true });

        if (sync?.pending) {
          return res.status(202).json({
            pending: true,
            error: 'Demo eligibility is still syncing to the contract. Wait a few seconds and try again.',
            merkleRoot,
            sync,
          });
        }

        if (!sync?.synced && sync?.reason !== 'already_synced') {
          if (listChanged) {
            removeDemoEligibleVoter(normalized);
          }
          return res.status(503).json({
            error:
              'Demo eligibility sync failed (cannot update on-chain merkleRoot). Check RPC_URL/PRIVATE_KEY and demo admin permissions.',
            merkleRoot,
            sync,
          });
        }
      }

      if (provider && adminWallet) {
        try {
          const balance = await provider.getBalance(normalized);
          if (balance < ethers.parseEther('0.005')) {
            funding = { attempted: true, sent: false, skipped: false, reason: 'low_balance', txHash: null, error: null };
            console.log('💸 User needs gas. Sending 0.01 ETH...');
            const tx = await adminWallet.sendTransaction({
              to: normalized,
              value: ethers.parseEther('0.01'),
            });
            if (DEMO_SYNC_WAIT_CONFIRMATIONS > 0) {
              await tx.wait(DEMO_SYNC_WAIT_CONFIRMATIONS);
            }
            funding = { attempted: true, sent: true, skipped: false, reason: null, txHash: tx.hash, error: null };
            console.log('✅ User funding transaction submitted.');
          } else {
            funding = { attempted: false, sent: false, skipped: true, reason: 'balance_sufficient', txHash: null, error: null };
          }
        } catch (fundingError) {
          console.warn('⚠️ Funding skipped after eligibility sync:', fundingError?.message || fundingError);
          funding = {
            attempted: true,
            sent: false,
            skipped: false,
            reason: 'funding_failed',
            txHash: null,
            error: fundingError?.message || String(fundingError),
          };
        }
      } else {
        funding = { attempted: false, sent: false, skipped: true, reason: 'missing_rpc_or_key', txHash: null, error: null };
        console.log('ℹ️ Funding skipped (missing RPC_URL or PRIVATE_KEY).');
      }

      let phase = null;
      if (demoState.enabled && provider && adminWallet) {
        try {
          const contract = await getDemoContract();
          if (contract) {
            phase = Number(await contract.phase());
            if (DEMO_START_MODE === 'on_first_join' && phase === 0 && !demoState.roundStartedAtMs) {
              demoState.roundId += 1;
              demoState.roundStartedAtMs = nowMs();
              demoState.commitEndsAtMs = null;
              demoState.revealEndsAtMs = null;
              demoState.finishedAtMs = null;
              demoState.resetAtMs = null;
              ensureDemoSchedule(0);
              persistDemoState();
            }
          }
        } catch {
          // ignore
        }
      }

      return res.json({
        success: true,
        message: 'Welcome to the demo!',
        merkleRoot,
        sync,
        funding,
        demo: demoStatusPayload({ phase }),
      });
    } catch (error) {
      if (listChanged && !sync?.synced) {
        removeDemoEligibleVoter(normalized);
      }
      console.error('❌ Onboarding failed:', error);
      return res.status(500).json({ error: error?.message || 'Onboarding failed' });
    }
  });
});

// Health check — no rate limit needed, used by uptime monitors
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ready at http://localhost:${PORT}`);

  if (demoState.enabled) {
    initDemoAutomation()
      .then(() => {
        if (!demoState.enabled) {
          console.log(`🤖 Demo autophasing disabled: ${demoState.reasonDisabled || 'unknown'}`);
          return;
        }

        console.log(
          `🤖 Demo autophasing enabled (${DEMO_START_MODE}). commit=${DEMO_COMMIT_SECONDS}s reveal=${DEMO_REVEAL_SECONDS}s autoreset=${DEMO_AUTORESET_ENABLED}`
        );

        setInterval(runDemoSchedulerOnce, Math.max(1000, DEMO_POLL_INTERVAL_MS));
        if (DEMO_ANALYTICS_ENABLED) {
          const analyticsPollMs = Math.max(5000, DEMO_POLL_INTERVAL_MS);
          setInterval(() => {
            scanDemoAnalyticsOnce().catch((e) => console.warn('Demo analytics scan failed', e?.message || e));
          }, analyticsPollMs);
          setTimeout(() => {
            scanDemoAnalyticsOnce().catch((e) => console.warn('Demo analytics scan failed', e?.message || e));
          }, 2000);
        }
        setTimeout(runDemoSchedulerOnce, 1500);
      })
      .catch((e) => console.error('🤖 Demo autophasing init failed:', e));
  }
});

module.exports = app;
