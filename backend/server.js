const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());

// For demonstration: A hardcoded list of eligible voter addresses.
// In a real application, this would come from a more dynamic source (e.g., smart contract, database).
const eligibleVoters = [
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Your Brave MetaMask account ID (Voter)
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0 (Admin) - Added to match deployment
    "0x0000000000000000000000000000000000000002", // Example voter 2
    "0x0000000000000000000000000000000000000003", // Example voter 3
    // Replace with your actual voter addresses if you have a known list for testing
];

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

app.get('/api/merkle-proof', (req, res) => {
    const voterId = req.query.voter_id;
    console.log(`Received Merkle proof request for voterId: ${voterId}`);

    if (!voterId) {
        return res.status(400).json({ error: 'voter_id is required' });
    }

    // Hash the incoming voter ID to match the leaf format (Buffer).
    // `toLowerCase()` is important here to canonicalize the address.
    const hashedVoterId = keccak256Hasher(voterId.toLowerCase());
    console.log('Checking voter ID:', voterId);
    console.log('Hashed voter ID for proof generation:', hashedVoterId.toString('hex'));

    const proofElements = tree.getProof(hashedVoterId);
    console.log('Debug: Proof Elements (first):', proofElements[0]?.data.toString('hex'), 'Type:', typeof proofElements[0]?.data);

    // Convert proof elements to 0x-prefixed hex strings for the frontend/contract.
    const proof = proofElements.map(x => '0x' + x.data.toString('hex'));
    console.log('DEBUG: Backend sending proof:', proof);

    // Verify the proof internally for debugging.
    const isEligible = tree.verify(proofElements, hashedVoterId, tree.getRoot());
    console.log('Is eligible:', isEligible);

    if (!isEligible) {
        return res.status(403).json({ error: 'Voter not eligible or proof invalid' });
    }

    res.json(proof);
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});