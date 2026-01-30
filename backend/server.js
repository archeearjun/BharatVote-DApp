const path = require('path');
const fs = require('fs');

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

const sanitizeVoterId = (id) => (typeof id === 'string' ? id.replace(/[^\w-]/g, '').slice(0, 64) : '');

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

const loadDemoAnalytics = () => {
  try {
    if (!fs.existsSync(DEMO_ANALYTICS_PATH)) return;
    const raw = fs.readFileSync(DEMO_ANALYTICS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.electionAddress && DEMO_ELECTION_ADDRESS && String(parsed.electionAddress).toLowerCase() !== String(DEMO_ELECTION_ADDRESS).toLowerCase()) {
      return;
    }
    Object.assign(demoAnalytics, parsed);
  } catch (e) {
    console.warn('Demo analytics: failed to load persisted file', e?.message || e);
  }
};

const saveDemoAnalytics = () => {
  try {
    fs.writeFileSync(DEMO_ANALYTICS_PATH, JSON.stringify(demoAnalytics, null, 2));
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

const scanDemoAnalyticsOnce = async () => {
  if (!DEMO_ANALYTICS_ENABLED) return;
  if (!provider) return;
  if (!DEMO_ELECTION_ADDRESS || !ethers.isAddress(DEMO_ELECTION_ADDRESS)) return;

  const latest = await provider.getBlockNumber();
  let fromBlock =
    typeof demoAnalytics.lastProcessedBlock === 'number'
      ? demoAnalytics.lastProcessedBlock + 1
      : Math.max(0, Number.isFinite(DEMO_ANALYTICS_FROM_BLOCK) ? DEMO_ANALYTICS_FROM_BLOCK : 0);

  if (fromBlock > latest) return;

  let requests = 0;
  while (fromBlock <= latest && requests < Math.max(1, DEMO_ANALYTICS_MAX_REQUESTS)) {
    const toBlock = Math.min(latest, fromBlock + Math.max(0, DEMO_ANALYTICS_BATCH_SIZE - 1));
    const logs = await provider.getLogs({
      address: DEMO_ELECTION_ADDRESS,
      fromBlock,
      toBlock,
    });
    requests += 1;

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

  saveDemoAnalytics();
};

loadDemoAnalytics();

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
    } else if (shouldFinish) {
      const tx = await contract.finishElection();
      await waitForTx(tx);
      demoState.lastTransitionTx = tx.hash;
      demoState.lastTransitionAtMs = nowMs();
      demoState.finishedAtMs = nowMs();
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
    }
  } catch (e) {
    console.error('? Demo scheduler tick failed:', e);
    demoState.lastError = formatDemoAutomationError({ action: null, err: e });
    demoState.lastErrorAtMs = nowMs();
    demoState.lastErrorPhase = demoState.lastObservedPhase;
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
  if (!voterId) {
    return res.status(400).json({ eligible: false, error: 'voter_id is required' });
  }

  const record = kycData.find((r) => String(r?.voterId || '').toUpperCase() === voterId.toUpperCase());
  if (!record) {
    return res.json({ eligible: false });
  }

  return res.json({ eligible: true, address: record.address });
});

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

  // Keep the public demo usable: if the backend allowlist changed, ensure the demo contract merkleRoot is synced.
  // This is a no-op when demo is not configured or when the root is already up to date.
  syncDemoElectionMerkleRootIfConfigured({ onlyIfChanged: true }).catch(() => {});

  const leaf = keccak256Hasher(normalized);
  const proofElements = tree.getProof(leaf);
  const ok = tree.verify(proofElements, leaf, tree.getRoot());
  if (!ok) return res.status(404).json({ error: 'Not eligible' });

  const proof = proofElements.map((x) => '0x' + x.data.toString('hex'));
  return res.json({ proof });
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
    latestKnownBlock: provider ? await provider.getBlockNumber() : null,
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

  try {
    let listChanged = false;

    const alreadyEligible = eligibleVoters.some((v) => v.toLowerCase() === normalized.toLowerCase());
    if (!alreadyEligible) {
      // If we cannot sync eligibility on-chain, do not mutate the allowlist.
      // Otherwise the UI will "join" but the contract will still revert with NotEligible.
      if (!provider || !adminWallet) {
        return res.status(503).json({
          error:
            'Public demo join is not enabled on this backend (missing RPC_URL/PRIVATE_KEY for on-chain merkleRoot sync).',
          reason: 'missing_rpc_or_key',
        });
      }

      // Ensure the configured wallet can administer the demo contract.
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
        if (DEMO_SYNC_WAIT_CONFIRMATIONS > 0) {
          await tx.wait(DEMO_SYNC_WAIT_CONFIRMATIONS);
        }
        console.log('✅ User funding transaction submitted.');
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
      return res.status(503).json({
        error:
          'Demo eligibility sync failed (cannot update on-chain merkleRoot). Check RPC_URL/PRIVATE_KEY and demo admin permissions.',
        merkleRoot,
        sync,
      });
    }

    // D. If demo autophasing is enabled, start the round schedule on first join (commit phase only).
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
      demo: demoStatusPayload({ phase }),
    });
  } catch (error) {
    console.error('❌ Onboarding failed:', error);
    return res.status(500).json({ error: error?.message || 'Onboarding failed' });
  }
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
