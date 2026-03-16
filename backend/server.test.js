const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256, ethers } = require('ethers');

// Mock the KYC data
jest.mock('./kyc-data.json', () => [
  { "voterId": "VOTER1", "address": "0x01bad59740664445Fd489315E14F4300639c253b" },
  { "voterId": "VOTER2", "address": "0xe0A8EE8D3f0F92a47C93af28F0685127c08Fd892" }
], { virtual: true });

// Mock the eligible voters JSON
jest.mock('../eligibleVoters.json', () => [
  "0x01bad59740664445Fd489315E14F4300639c253b",
  "0xe0A8EE8D3f0F92a47C93af28F0685127c08Fd892"
], { virtual: true });

describe('BharatVote Backend API', () => {
  let app;
  let server;
  let merkleRootHex;

  beforeAll(() => {
    // Create a test version of the server without starting it
    const keccak256Hasher = (data) => {
      if (typeof data === 'string') {
        return Buffer.from(solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
      } else if (Buffer.isBuffer(data)) {
        return Buffer.from(keccak256(data).substring(2), 'hex');
      } else {
        throw new Error("Invalid data type for keccak256Hasher: Expected string or Buffer");
      }
    };

    app = express();
    app.use(cors());
    app.use(express.json());

    const eligibleVoters = require("../eligibleVoters.json");
    const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
    const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
    merkleRootHex = '0x' + tree.getRoot().toString('hex');
    const kycData = require("./kyc-data.json");

    // KYC endpoint
    app.get('/api/kyc', (req, res) => {
      const voterId = req.query.voter_id;
      if (!voterId || typeof voterId !== 'string') {
        return res.status(400).json({ eligible: false, error: 'voter_id is required' });
      }
      const record = kycData.find(r => r.voterId === voterId);
      if (!record) {
        return res.json({ eligible: false });
      }
      return res.json({ eligible: true, address: record.address });
    });

    // Merkle proof endpoint
    app.get('/api/merkle-proof', (req, res) => {
      const voterId = req.query.voter_id;
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

      if (!isEligible) {
        return res.status(403).json({ error: 'Voter not eligible or proof invalid' });
      }

      res.json(proof);
    });

    // Merkle root endpoint
    app.get('/api/merkle-root', (_req, res) => {
      res.json({ merkleRoot: merkleRootHex });
    });
  });

  describe('KYC API', () => {
    describe('GET /api/kyc', () => {
      it('should return eligible true for valid voter ID', async () => {
        const response = await request(app)
          .get('/api/kyc')
          .query({ voter_id: 'VOTER1' })
          .expect(200);

        expect(response.body).toEqual({
          eligible: true,
          address: '0x01bad59740664445Fd489315E14F4300639c253b'
        });
      });

      it('should return eligible false for invalid voter ID', async () => {
        const response = await request(app)
          .get('/api/kyc')
          .query({ voter_id: 'INVALID_VOTER' })
          .expect(200);

        expect(response.body).toEqual({
          eligible: false
        });
      });

      it('should return error for missing voter_id', async () => {
        const response = await request(app)
          .get('/api/kyc')
          .expect(400);

        expect(response.body).toEqual({
          eligible: false,
          error: 'voter_id is required'
        });
      });

      it('should handle all test voter IDs correctly', async () => {
        const testCases = [
          { voterId: 'VOTER1', address: '0x01bad59740664445Fd489315E14F4300639c253b' },
          { voterId: 'VOTER2', address: '0xe0A8EE8D3f0F92a47C93af28F0685127c08Fd892' }
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .get('/api/kyc')
            .query({ voter_id: testCase.voterId })
            .expect(200);

          expect(response.body).toEqual({
            eligible: true,
            address: testCase.address
          });
        }
      });
    });
  });

  describe('Merkle Proof API', () => {
    describe('GET /api/merkle-proof', () => {
      it('should return valid proof for eligible voter', async () => {
        const response = await request(app)
          .get('/api/merkle-proof')
          .query({ voter_id: 'VOTER1' })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        // All proof elements should be hex strings
        response.body.forEach(element => {
          expect(element).toMatch(/^0x[a-fA-F0-9]{64}$/);
        });
      });

      it('should return error for missing voter_id', async () => {
        const response = await request(app)
          .get('/api/merkle-proof')
          .expect(400);

        expect(response.body).toEqual({
          error: 'voter_id is required'
        });
      });

      it('should return error for invalid voter ID', async () => {
        const response = await request(app)
          .get('/api/merkle-proof')
          .query({ voter_id: 'INVALID_VOTER' })
          .expect(403);

        expect(response.body).toEqual({
          error: 'Voter ID not found in KYC records'
        });
      });

      it('should generate different proofs for different voters', async () => {
        const response1 = await request(app)
          .get('/api/merkle-proof')
          .query({ voter_id: 'VOTER1' })
          .expect(200);

        const response2 = await request(app)
          .get('/api/merkle-proof')
          .query({ voter_id: 'VOTER2' })
          .expect(200);

        // Proofs should be different (unless they're siblings in the tree)
        expect(response1.body).not.toEqual(response2.body);
      });

      it('should handle all eligible voters', async () => {
        const voterIds = ['VOTER1', 'VOTER2'];
        
        for (const voterId of voterIds) {
          const response = await request(app)
            .get('/api/merkle-proof')
            .query({ voter_id: voterId })
            .expect(200);

          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Merkle Root API', () => {
    it('should return the merkle root', async () => {
      const response = await request(app)
        .get('/api/merkle-root')
        .expect(200);

      expect(response.body).toEqual({ merkleRoot: merkleRootHex });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should handle malformed requests', async () => {
      await request(app)
        .post('/api/kyc')
        .send({ invalid: 'data' })
        .expect(404); // Should not match any routes
    });
  });

  describe('Security Tests', () => {
    it('should handle SQL injection attempts in voter_id', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get('/api/kyc')
        .query({ voter_id: maliciousInput })
        .expect(200);

      expect(response.body).toEqual({
        eligible: false
      });
    });

    it('should handle XSS attempts in voter_id', async () => {
      const maliciousInput = "<script>alert('xss')</script>";
      
      const response = await request(app)
        .get('/api/kyc')
        .query({ voter_id: maliciousInput })
        .expect(200);

      expect(response.body).toEqual({
        eligible: false
      });
    });

    it('should handle very long voter_id strings', async () => {
      const longInput = 'A'.repeat(10000);
      
      const response = await request(app)
        .get('/api/kyc')
        .query({ voter_id: longInput })
        .expect(200);

      expect(response.body).toEqual({
        eligible: false
      });
    });
  });

  describe('Performance Tests', () => {
    it('should respond to KYC requests quickly', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/kyc')
        .query({ voter_id: 'VOTER1' })
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // Allow small variance
    });

    it('should respond to Merkle proof requests quickly', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/merkle-proof')
        .query({ voter_id: 'VOTER1' })
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // Should respond within 200ms
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/kyc')
            .query({ voter_id: 'VOTER1' })
            .expect(200)
        );
      }

      const results = await Promise.all(promises);
      results.forEach(response => {
        expect(response.body.eligible).toBe(true);
      });
    });
  });

  describe('Admin Allowlist Auth', () => {
    // Build a minimal admin voter-list endpoint that mirrors server.js auth logic
    // so we can unit-test the validation rules without a live blockchain.
    let adminApp;
    const FAKE_ELECTION = '0x1234567890123456789012345678901234567890';
    const TTL_MS = 300_000; // 5 min

    const buildMessage = (electionAddress, addresses, issuedAt) => {
      const addressesHash = ethers.keccak256(ethers.toUtf8Bytes(addresses.join('\n')));
      return [
        'BharatVote Admin Allowlist Upload',
        `Election: ${electionAddress}`,
        `Addresses Hash: ${addressesHash}`,
        `Issued At: ${issuedAt}`,
      ].join('\n');
    };

    beforeAll(() => {
      adminApp = express();
      adminApp.use(express.json());

      // No provider in tests — RPC step returns 503 for valid sigs
      adminApp.post('/api/admin/voter-list', async (req, res) => {
        const electionAddress = String(req.body?.electionAddress || '').trim();
        if (!electionAddress || !ethers.isAddress(electionAddress)) {
          return res.status(400).json({ error: 'Valid electionAddress is required' });
        }
        const auth = req.body?.auth;
        const issuedAt = Number(auth?.issuedAt);
        const signature = typeof auth?.signature === 'string' ? auth.signature.trim() : '';
        if (!Number.isFinite(issuedAt) || !signature) {
          return res.status(401).json({ error: 'Missing admin signature' });
        }
        const serverNow = Date.now();
        if (issuedAt > serverNow + 30_000 || serverNow - issuedAt > TTL_MS) {
          return res.status(401).json({ error: 'Admin signature expired. Please sign again.' });
        }
        const addresses = Array.isArray(req.body?.addresses)
          ? req.body.addresses.filter(a => ethers.isAddress(a))
          : [];
        const message = buildMessage(electionAddress, addresses, issuedAt);
        let recovered;
        try {
          recovered = ethers.verifyMessage(message, signature);
        } catch {
          return res.status(401).json({ error: 'Invalid admin signature' });
        }
        // No provider in tests → simulate 503
        return res.status(503).json({ error: 'RPC provider not configured for admin verification', recovered });
      });
    });

    it('returns 400 for missing electionAddress', async () => {
      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({ addresses: [], auth: { issuedAt: Date.now(), signature: '0x' + '00'.repeat(65) } });
      expect(res.status).toBe(400);
    });

    it('returns 401 for missing signature', async () => {
      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({ electionAddress: FAKE_ELECTION, addresses: [], auth: {} });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Missing admin signature/);
    });

    it('returns 401 for expired issuedAt (too old)', async () => {
      const expiredAt = Date.now() - TTL_MS - 1000;
      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({
          electionAddress: FAKE_ELECTION,
          addresses: [],
          auth: { issuedAt: expiredAt, signature: '0x' + '00'.repeat(65) },
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/expired/);
    });

    it('returns 401 for future-dated issuedAt (> 30s ahead)', async () => {
      const futureAt = Date.now() + 60_000; // 60s in the future
      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({
          electionAddress: FAKE_ELECTION,
          addresses: [],
          auth: { issuedAt: futureAt, signature: '0x' + '00'.repeat(65) },
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/expired/);
    });

    it('returns 401 for malformed signature', async () => {
      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({
          electionAddress: FAKE_ELECTION,
          addresses: [],
          auth: { issuedAt: Date.now(), signature: 'not-a-valid-sig' },
        });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid admin signature/);
    });

    it('recovers correct signer from a valid EIP-191 signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const issuedAt = Date.now();
      const addresses = [wallet.address];
      const message = buildMessage(FAKE_ELECTION, addresses, issuedAt);
      const signature = await wallet.signMessage(message);

      const res = await request(adminApp)
        .post('/api/admin/voter-list')
        .send({ electionAddress: FAKE_ELECTION, addresses, auth: { issuedAt, signature } });

      // Without RPC the endpoint returns 503 but includes recovered address
      expect(res.status).toBe(503);
      expect(res.body.recovered.toLowerCase()).toBe(wallet.address.toLowerCase());
    });
  });
}); 
