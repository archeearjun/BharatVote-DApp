const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256 } = require('ethers');

// Mock the KYC data
jest.mock('./kyc-data.json', () => [
  { "voterId": "VOTER1", "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
  { "voterId": "VOTER2", "address": "0x0000000000000000000000000000000000000002" },
  { "voterId": "VOTER3", "address": "0x0000000000000000000000000000000000000003" },
  { "voterId": "VOTER4", "address": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" }
], { virtual: true });

// Mock the eligible voters JSON
jest.mock('../eligibleVoters.json', () => [
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x0000000000000000000000000000000000000002",
  "0x0000000000000000000000000000000000000003",
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
], { virtual: true });

describe('BharatVote Backend API', () => {
  let app;
  let server;

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
          address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
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
          { voterId: 'VOTER1', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
          { voterId: 'VOTER2', address: '0x0000000000000000000000000000000000000002' },
          { voterId: 'VOTER3', address: '0x0000000000000000000000000000000000000003' },
          { voterId: 'VOTER4', address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199' }
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
        const voterIds = ['VOTER1', 'VOTER2', 'VOTER3', 'VOTER4'];
        
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
      expect(duration).toBeLessThan(100); // Should respond within 100ms
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
}); 