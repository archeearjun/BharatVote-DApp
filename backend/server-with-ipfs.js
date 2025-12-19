/**
 * Enhanced BharatVote Backend with IPFS Integration
 * Stores all critical data on IPFS for decentralization and immutability
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256 } = require('ethers');
const IPFSService = require('./ipfs-service');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize IPFS Service (gated by env so we can run free/local)
const ipfsEnabled = Boolean(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY);
const ipfsService = new IPFSService(
    process.env.PINATA_API_KEY,
    process.env.PINATA_SECRET_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
});
app.use('/api/', apiLimiter);

// Input sanitizer
const sanitizeVoterId = (id) => (typeof id === 'string' ? id.replace(/[^\w-]/g, '').slice(0, 64) : '');

// Keccak256 hasher for Merkle tree
const keccak256Hasher = (data) => {
    if (typeof data === 'string') {
        return Buffer.from(solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
    } else if (Buffer.isBuffer(data)) {
        return Buffer.from(keccak256(data).substring(2), 'hex');
    } else {
        throw new Error("Invalid data type for keccak256Hasher");
    }
};

// Load data (will be stored on IPFS)
let kycData = require("./kyc-data.json");
let eligibleVoters = require("../eligibleVoters.json");

// IPFS storage references
let ipfsReferences = {
    kycDataHash: null,
    voterListHash: null,
    resultsHash: null,
    auditTrailHash: null
};

// Audit trail
let auditLogs = [];

// Helper middleware to guard IPFS routes when keys are missing
const ensureIpfsEnabled = (_req, res, next) => {
    if (!ipfsEnabled) {
        return res.status(503).json({ error: 'IPFS is disabled (no Pinata keys configured)' });
    }
    next();
};

// Generate Merkle tree
const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
const merkleRootHex = tree.getRoot().toString('hex');

console.log('🌳 Merkle Root:', merkleRootHex);

/* ═══════════════════════════════════════════════════════
   IPFS INITIALIZATION - Store Initial Data on IPFS
   ═══════════════════════════════════════════════════════ */

async function initializeIPFSStorage() {
    if (!ipfsEnabled) {
        console.warn('⚠️  IPFS disabled (no PINATA_API_KEY/SECRET set). Skipping IPFS init.');
        return;
    }
    try {
        console.log('\n🚀 Initializing IPFS storage...\n');

        // Test authentication
        const authSuccess = await ipfsService.testAuthentication();
        if (!authSuccess) {
            console.warn('⚠️  IPFS service not available. Running in fallback mode.');
            return;
        }

        // Store KYC data
        console.log('📤 Storing KYC data on IPFS...');
        const kycResult = await ipfsService.storeKYCData(kycData);
        ipfsReferences.kycDataHash = kycResult.ipfsHash;
        console.log(`✅ KYC Data: ${kycResult.gatewayUrl}`);
        auditLogs.push(ipfsService.createAuditLog('KYC_DATA_STORED', { ipfsHash: kycResult.ipfsHash }));

        // Store eligible voters list
        console.log('\n📤 Storing eligible voters list on IPFS...');
        const voterResult = await ipfsService.storeVoterList(eligibleVoters);
        ipfsReferences.voterListHash = voterResult.ipfsHash;
        console.log(`✅ Voter List: ${voterResult.gatewayUrl}`);
        auditLogs.push(ipfsService.createAuditLog('VOTER_LIST_STORED', { 
            ipfsHash: voterResult.ipfsHash,
            totalVoters: eligibleVoters.length,
            merkleRoot: merkleRootHex
        }));

        // Store initial audit trail
        console.log('\n📤 Storing audit trail on IPFS...');
        const auditResult = await ipfsService.storeAuditTrail(auditLogs);
        ipfsReferences.auditTrailHash = auditResult.ipfsHash;
        console.log(`✅ Audit Trail: ${auditResult.gatewayUrl}`);

        console.log('\n✅ IPFS initialization complete!\n');
        console.log('📋 IPFS References:');
        console.log(JSON.stringify(ipfsReferences, null, 2));
        console.log('\n💡 Store these IPFS hashes on-chain using the smart contract!\n');

    } catch (error) {
        console.error('❌ Failed to initialize IPFS storage:', error.message);
        console.warn('⚠️  Continuing without IPFS storage...');
    }
}

/* ═══════════════════════════════════════════════════════
   API ENDPOINTS
   ═══════════════════════════════════════════════════════ */

/**
 * GET /api/kyc
 * Mock KYC verification endpoint
 */
app.get('/api/kyc', async (req, res) => {
    const voterId = sanitizeVoterId(req.query.voter_id);
    
    if (!voterId) {
        return res.status(400).json({ eligible: false, error: 'voter_id is required' });
    }

    const record = kycData.find(r => r.voterId === voterId);
    
    if (!record) {
        return res.json({ eligible: false });
    }

    // Log to audit trail
    auditLogs.push(ipfsService.createAuditLog('KYC_VERIFICATION', {
        voterId: voterId,
        status: 'verified',
        ipfsReference: ipfsReferences.kycDataHash
    }));

    return res.json({ 
        eligible: true, 
        address: record.address,
        ipfsReference: ipfsReferences.kycDataHash
    });
});

/**
 * GET /api/merkle-proof
 * Generate Merkle proof for voter eligibility
 */
app.get('/api/merkle-proof', async (req, res) => {
    const voterId = sanitizeVoterId(req.query.voter_id);
    console.log(`🔍 Merkle proof request for voterId: ${voterId}`);

    if (!voterId) {
        return res.status(400).json({ error: 'voter_id is required' });
    }

    const kycRecord = kycData.find(r => r.voterId === voterId);
    
    if (!kycRecord) {
        return res.status(403).json({ error: 'Voter ID not found in KYC records' });
    }

    const voterAddress = kycRecord.address;
    const hashedAddress = keccak256Hasher(voterAddress.toLowerCase());
    const proofElements = tree.getProof(hashedAddress);
    const proof = proofElements.map(x => '0x' + x.data.toString('hex'));

    const isEligible = tree.verify(proofElements, hashedAddress, tree.getRoot());
    console.log(`✅ Voter ${voterId} eligibility:`, isEligible);

    if (!isEligible) {
        return res.status(403).json({ error: 'Voter not eligible or proof invalid' });
    }

    // Log to audit trail
    auditLogs.push(ipfsService.createAuditLog('MERKLE_PROOF_GENERATED', {
        voterId: voterId,
        voterAddress: voterAddress,
        ipfsReference: ipfsReferences.voterListHash
    }));

    res.json({
        proof: proof,
        merkleRoot: '0x' + merkleRootHex,
        ipfsReference: ipfsReferences.voterListHash
    });
});

// Expose Merkle root for clients/admins to set on-chain
app.get('/api/merkle-root', (_req, res) => {
    res.json({ merkleRoot: '0x' + merkleRootHex });
});

/**
 * GET /api/ipfs/references
 * Get all IPFS references
 */
app.get('/api/ipfs/references', ensureIpfsEnabled, (req, res) => {
    res.json(ipfsReferences);
});

/**
 * GET /api/ipfs/data/:hash
 * Retrieve data from IPFS
 */
app.get('/api/ipfs/data/:hash', ensureIpfsEnabled, async (req, res) => {
    try {
        const data = await ipfsService.getFromIPFS(req.params.hash);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data from IPFS' });
    }
});

/**
 * POST /api/ipfs/store-results
 * Store election results on IPFS (Admin only)
 */
app.post('/api/ipfs/store-results', ensureIpfsEnabled, async (req, res) => {
    try {
        const results = req.body;
        const result = await ipfsService.storeResults(results);
        ipfsReferences.resultsHash = result.ipfsHash;

        auditLogs.push(ipfsService.createAuditLog('RESULTS_STORED', {
            ipfsHash: result.ipfsHash,
            totalVotes: results.totalVotes
        }));

        // Update audit trail on IPFS
        const auditResult = await ipfsService.storeAuditTrail(auditLogs);
        ipfsReferences.auditTrailHash = auditResult.ipfsHash;

        res.json({
            success: true,
            resultsHash: result.ipfsHash,
            gatewayUrl: result.gatewayUrl
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to store results on IPFS' });
    }
});

/**
 * GET /api/audit-trail
 * Get audit trail (from memory or IPFS)
 */
app.get('/api/audit-trail', async (req, res) => {
    res.json({
        logs: auditLogs,
        ipfsReference: ipfsReferences.auditTrailHash
    });
});

/**
 * POST /api/ipfs/update-audit
 * Manually trigger audit trail update on IPFS
 */
app.post('/api/ipfs/update-audit', ensureIpfsEnabled, async (req, res) => {
    try {
        const auditResult = await ipfsService.storeAuditTrail(auditLogs);
        ipfsReferences.auditTrailHash = auditResult.ipfsHash;

        res.json({
            success: true,
            auditHash: auditResult.ipfsHash,
            gatewayUrl: auditResult.gatewayUrl
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update audit trail on IPFS' });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        ipfsEnabled,
        merkleRoot: '0x' + merkleRootHex,
        ipfsReferences: ipfsReferences
    });
});

/* ═══════════════════════════════════════════════════════
   START SERVER
   ═══════════════════════════════════════════════════════ */

async function startServer() {
    // Initialize IPFS storage first
    await initializeIPFSStorage();

    // Start Express server
    app.listen(port, () => {
        console.log(`\n🚀 BharatVote Backend (IPFS-enabled) running at http://localhost:${port}`);
        console.log(`\n📚 Available endpoints:`);
        console.log(`   - GET  /api/kyc?voter_id=VOTER1`);
        console.log(`   - GET  /api/merkle-proof?voter_id=VOTER1`);
        console.log(`   - GET  /api/ipfs/references`);
        console.log(`   - GET  /api/ipfs/data/:hash`);
        console.log(`   - POST /api/ipfs/store-results`);
        console.log(`   - GET  /api/audit-trail`);
        console.log(`   - POST /api/ipfs/update-audit`);
        console.log(`   - GET  /api/health\n`);
    });
}

// Start the server
startServer().catch(console.error);

module.exports = app;

