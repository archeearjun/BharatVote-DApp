import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import * as fs from "fs";
import * as path from "path";

/**
 * Generate Merkle Proof Script (Week 4)
 * 
 * Generates Merkle proofs for voter addresses from eligibleVoters.json
 * 
 * Usage:
 *   npx hardhat run scripts/generate-proof.ts
 *   npx hardhat run scripts/generate-proof.ts -- <address>
 * 
 * Examples:
 *   npx hardhat run scripts/generate-proof.ts -- 0x90F79bf6EB2c4f870365E785982E1f101E93b906
 */

async function main() {
  console.log("🌳 Merkle Proof Generator (Week 4)\n");

  // Load eligible voters
  const eligibleVotersPath = path.join(__dirname, "..", "..", "eligibleVoters.json");
  
  if (!fs.existsSync(eligibleVotersPath)) {
    console.error("❌ eligibleVoters.json not found!");
    console.error(`   Expected at: ${eligibleVotersPath}`);
    process.exit(1);
  }

  const eligibleVoters: string[] = JSON.parse(
    fs.readFileSync(eligibleVotersPath, "utf8")
  );

  if (!Array.isArray(eligibleVoters) || eligibleVoters.length === 0) {
    console.error("❌ eligibleVoters.json is empty or invalid!");
    process.exit(1);
  }

  console.log(`📝 Loaded ${eligibleVoters.length} eligible voters\n`);

  // Create leaf hasher (must match contract's keccak256(abi.encodePacked(address)))
  const makeLeaf = (addr: string): Buffer => {
    const normalized = addr.toLowerCase();
    const hash = ethers.solidityPackedKeccak256(["address"], [normalized]);
    return Buffer.from(hash.slice(2), "hex");
  };

  // Build Merkle tree (must match contract's verification logic)
  const leaves = eligibleVoters.map((addr) => makeLeaf(addr));
  const tree = new MerkleTree(
    leaves,
    (data: Buffer) => Buffer.from(ethers.keccak256(data).slice(2), "hex"),
    {
      sortLeaves: true,
      sortPairs: true, // Critical: matches contract's sorted verification
    }
  );

  const merkleRoot = "0x" + tree.getRoot().toString("hex");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 MERKLE TREE INFO");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Merkle Root: ${merkleRoot}`);
  console.log(`Tree Depth:  ${tree.getDepth()}`);
  console.log(`Leaf Count:  ${leaves.length}\n`);

  // Check if specific address requested
  const args = process.argv.slice(2);
  const requestedAddress = args[0];

  if (requestedAddress) {
    // Generate proof for specific address
    const normalized = requestedAddress.toLowerCase();
    
    if (!eligibleVoters.some((addr) => addr.toLowerCase() === normalized)) {
      console.error(`❌ Address ${requestedAddress} is not in eligible voters list!`);
      process.exit(1);
    }

    const leaf = makeLeaf(normalized);
    const proof = tree.getProof(leaf);
    const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔍 PROOF FOR: ${requestedAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Leaf Hash: ${"0x" + leaf.toString("hex")}`);
    console.log(`Proof Length: ${proofHex.length} elements\n`);
    console.log("Proof Array (for contract):");
    console.log(JSON.stringify(proofHex, null, 2));
    console.log("\n");

    // Verify proof
    const isValid = tree.verify(proof, leaf, tree.getRoot());
    console.log(`✅ Proof Valid: ${isValid}\n`);

    // Save to file
    const proofData = {
      address: requestedAddress,
      leaf: "0x" + leaf.toString("hex"),
      proof: proofHex,
      merkleRoot: merkleRoot,
      verified: isValid,
    };

    const outputPath = path.join(__dirname, "..", "proofs", `${normalized.slice(2, 10)}.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(proofData, null, 2));
    console.log(`💾 Saved proof to: ${outputPath}\n`);
  } else {
    // Generate proofs for all addresses
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 GENERATING PROOFS FOR ALL VOTERS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const proofsDir = path.join(__dirname, "..", "proofs");
    fs.mkdirSync(proofsDir, { recursive: true });

    const allProofs: Record<string, any> = {};

    for (const addr of eligibleVoters) {
      const normalized = addr.toLowerCase();
      const leaf = makeLeaf(normalized);
      const proof = tree.getProof(leaf);
      const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));

      const proofData = {
        address: addr,
        leaf: "0x" + leaf.toString("hex"),
        proof: proofHex,
        merkleRoot: merkleRoot,
        verified: tree.verify(proof, leaf, tree.getRoot()),
      };

      allProofs[normalized] = proofData;

      // Save individual proof
      const outputPath = path.join(proofsDir, `${normalized.slice(2, 10)}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(proofData, null, 2));
    }

    // Save all proofs in one file
    const allProofsPath = path.join(proofsDir, "all-proofs.json");
    fs.writeFileSync(allProofsPath, JSON.stringify({ merkleRoot, proofs: allProofs }, null, 2));

    console.log(`✅ Generated ${eligibleVoters.length} proofs`);
    console.log(`💾 Saved to: ${proofsDir}/`);
    console.log(`💾 Combined file: ${allProofsPath}\n`);

    // Show sample proof
    const firstAddr = eligibleVoters[0];
    const firstProof = allProofs[firstAddr.toLowerCase()];
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 SAMPLE PROOF (First Voter)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Address: ${firstProof.address}`);
    console.log(`Proof Length: ${firstProof.proof.length} elements`);
    console.log(`Verified: ${firstProof.verified}\n`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ PROOF GENERATION COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Next steps:");
  console.log("1. Use these proofs in commitVote() calls");
  console.log("2. Verify merkleRoot matches contract: await contract.merkleRoot()");
  console.log("3. Test voting with: npm run test-vote\n");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

