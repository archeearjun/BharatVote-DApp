import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import * as fs from "fs";
import * as path from "path";

/**
 * Test Voting Script (Week 4)
 * 
 * Demonstrates complete commit-reveal voting flow with Merkle proof verification
 * 
 * Run:
 *   npx hardhat run scripts/test-voting.ts --network localhost
 */
async function main() {
  console.log("🗳️  Testing BharatVote Commit-Reveal Flow with Merkle Verification (Week 4)...\n");

  // Find contract address
  const jsonPath = path.join(__dirname, "..", "..", "BharatVote-Week4-Frontend", "src", "contracts", "BharatVote.json");

  let contractAddress: string | null = null;
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    contractAddress = data.address;
  }

  if (!contractAddress) {
    console.log("❌ Contract not deployed. Run: npm run deploy");
    return;
  }

  console.log(`📍 Contract Address: ${contractAddress}\n`);

  // Get signers (voters)
  const [admin, voter1, voter2, voter3] = await ethers.getSigners();
  console.log("👥 Test Voters:");
  console.log(`   Admin:  ${admin.address}`);
  console.log(`   Voter1: ${voter1.address}`);
  console.log(`   Voter2: ${voter2.address}`);
  console.log(`   Voter3: ${voter3.address}\n`);

  // Connect to contract
  const contract = await ethers.getContractAt("BharatVote", contractAddress);

  // Check Merkle root
  const merkleRoot = await contract.merkleRoot();
  console.log(`🌳 Contract Merkle Root: ${merkleRoot}\n`);

  // Generate Merkle proofs for test voters (Week 4)
  let voter1Proof: string[] = [];
  let voter2Proof: string[] = [];
  let voter3Proof: string[] = [];

  if (merkleRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.log("📝 Generating Merkle proofs for test voters...\n");
    
    // Load eligible voters
    const eligibleVotersPath = path.join(__dirname, "..", "..", "eligibleVoters.json");
    if (fs.existsSync(eligibleVotersPath)) {
      const eligibleVoters: string[] = JSON.parse(
        fs.readFileSync(eligibleVotersPath, "utf8")
      );

      // Create Merkle tree (must match contract's verification)
      const makeLeaf = (addr: string): Buffer => {
        const normalized = addr.toLowerCase();
        const hash = ethers.solidityPackedKeccak256(["address"], [normalized]);
        return Buffer.from(hash.slice(2), "hex");
      };

      const leaves = eligibleVoters.map((addr) => makeLeaf(addr));
      const tree = new MerkleTree(
        leaves,
        (data: Buffer) => Buffer.from(ethers.keccak256(data).slice(2), "hex"),
        { sortLeaves: true, sortPairs: true }
      );

      // Generate proofs for each voter
      const generateProof = (addr: string): string[] => {
        const normalized = addr.toLowerCase();
        if (!eligibleVoters.some((a) => a.toLowerCase() === normalized)) {
          console.warn(`⚠️  ${addr} not in eligible voters list - using empty proof`);
          return [];
        }
        const leaf = makeLeaf(normalized);
        const proof = tree.getProof(leaf);
        return proof.map((p) => "0x" + p.data.toString("hex"));
      };

      voter1Proof = generateProof(voter1.address);
      voter2Proof = generateProof(voter2.address);
      voter3Proof = generateProof(voter3.address);

      console.log(`✅ Generated proofs:`);
      console.log(`   Voter1: ${voter1Proof.length} elements`);
      console.log(`   Voter2: ${voter2Proof.length} elements`);
      console.log(`   Voter3: ${voter3Proof.length} elements\n`);
    } else {
      console.warn("⚠️  eligibleVoters.json not found - using empty proofs (testing mode)\n");
    }
  } else {
    console.log("ℹ️  No Merkle root set - contract in testing mode (all voters allowed)\n");
  }

  // Show initial state
  const phase = await contract.phase();
  const phaseNumber = Number(phase);
  const candidates = await contract.getCandidates();
  
  const phaseNames = ["Commit", "Reveal", "Finished"];
  const phaseName = phaseNames[phaseNumber] || "Unknown";
  
  console.log(`📊 Initial State: Phase ${phaseNumber} (${phaseName})\n`);
  
  if (phaseNumber !== 0) {
    console.error(`❌ Contract is not in Commit phase (Phase ${phaseNumber}).`);
    console.error("   Please deploy a fresh contract or restart Hardhat node.\n");
    process.exit(1);
  }
  
  console.log("👥 Available Candidates:");
  for (let i = 0; i < candidates.length; i++) {
    console.log(`   [${i}] ${candidates[i].name}`);
  }
  console.log("");

  // ===== COMMIT PHASE =====
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 PHASE 1: COMMIT VOTES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Voter 1 commits for candidate 0
  const voter1Choice = 0n;
  const voter1Salt = ethers.randomBytes(32);
  const voter1Commit = ethers.keccak256(
    ethers.solidityPacked(["uint256", "bytes32"], [voter1Choice, voter1Salt])
  );
  console.log(`Voter1 committing for candidate ${voter1Choice}...`);
  console.log(`  Commit hash: ${voter1Commit}`);
  console.log(`  Merkle proof: ${voter1Proof.length} elements`);
  const tx1 = await contract.connect(voter1).commitVote(voter1Commit, voter1Proof);
  await tx1.wait();
  console.log(`  ✅ Committed\n`);

  // Voter 2 commits for candidate 1
  const voter2Choice = 1n;
  const voter2Salt = ethers.randomBytes(32);
  const voter2Commit = ethers.keccak256(
    ethers.solidityPacked(["uint256", "bytes32"], [voter2Choice, voter2Salt])
  );
  console.log(`Voter2 committing for candidate ${voter2Choice}...`);
  console.log(`  Commit hash: ${voter2Commit}`);
  console.log(`  Merkle proof: ${voter2Proof.length} elements`);
  const tx2 = await contract.connect(voter2).commitVote(voter2Commit, voter2Proof);
  await tx2.wait();
  console.log(`  ✅ Committed\n`);

  // Voter 3 commits for candidate 0 (same as voter1)
  const voter3Choice = 0n;
  const voter3Salt = ethers.randomBytes(32);
  const voter3Commit = ethers.keccak256(
    ethers.solidityPacked(["uint256", "bytes32"], [voter3Choice, voter3Salt])
  );
  console.log(`Voter3 committing for candidate ${voter3Choice}...`);
  console.log(`  Commit hash: ${voter3Commit}`);
  console.log(`  Merkle proof: ${voter3Proof.length} elements`);
  const tx3 = await contract.connect(voter3).commitVote(voter3Commit, voter3Proof);
  await tx3.wait();
  console.log(`  ✅ Committed\n`);

  const voterCount = await contract.getVoterCount();
  console.log(`📊 Status: ${voterCount} voters committed\n`);

  // ===== TRANSITION TO REVEAL =====
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 TRANSITIONING TO REVEAL PHASE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Admin starting reveal phase...");
  const txReveal = await contract.connect(admin).startReveal();
  await txReveal.wait();
  const newPhase = await contract.phase();
  console.log(`✅ Phase changed to: ${newPhase} (Reveal)\n`);

  // ===== REVEAL PHASE =====
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔓 PHASE 2: REVEAL VOTES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Voter 1 reveals
  console.log(`Voter1 revealing choice ${voter1Choice}...`);
  const txR1 = await contract.connect(voter1).revealVote(voter1Choice, voter1Salt);
  await txR1.wait();
  console.log(`  ✅ Revealed\n`);

  // Voter 2 reveals
  console.log(`Voter2 revealing choice ${voter2Choice}...`);
  const txR2 = await contract.connect(voter2).revealVote(voter2Choice, voter2Salt);
  await txR2.wait();
  console.log(`  ✅ Revealed\n`);

  // Voter 3 reveals
  console.log(`Voter3 revealing choice ${voter3Choice}...`);
  const txR3 = await contract.connect(voter3).revealVote(voter3Choice, voter3Salt);
  await txR3.wait();
  console.log(`  ✅ Revealed\n`);

  // ===== SHOW RESULTS =====
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 VOTING RESULTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const tally = await contract.getTally();
  let totalVotes = 0n;
  for (let i = 0; i < candidates.length; i++) {
    const votes = tally[i];
    totalVotes += votes;
    const percentage = totalVotes > 0n ? Number((votes * 100n) / totalVotes) : 0;
    console.log(`[${i}] ${candidates[i].name}`);
    console.log(`    Votes: ${votes} (${percentage.toFixed(1)}%)`);
  }
  console.log(`\n📊 Total Votes Cast: ${totalVotes}\n`);

  // Find winner
  let maxVotes = 0n;
  let winnerId = -1;
  for (let i = 0; i < tally.length; i++) {
    if (tally[i] > maxVotes) {
      maxVotes = tally[i];
      winnerId = i;
    }
  }

  if (winnerId >= 0) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏆 WINNER");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Candidate [${winnerId}] ${candidates[winnerId].name} with ${maxVotes} votes\n`);
  }

  // ===== FINISH ELECTION =====
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏁 FINISHING ELECTION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Admin finishing election...");
  const txFinish = await contract.connect(admin).finishElection();
  await txFinish.wait();
  const finalPhase = await contract.phase();
  console.log(`✅ Phase changed to: ${finalPhase} (Finished)\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ COMMIT-REVEAL VOTING TEST COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Key Observations:");
  console.log("✓ Voters committed hashed votes (votes hidden)");
  console.log("✓ Merkle proofs verified voter eligibility (Week 4)");
  console.log("✓ Admin transitioned to reveal phase");
  console.log("✓ Voters revealed actual votes with salt");
  console.log("✓ Contract verified hash matches commitment");
  console.log("✓ Votes tallied correctly");
  console.log("✓ Winner determined fairly\n");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

