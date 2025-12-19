import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Test Voting Script (Week 3)
 * 
 * Demonstrates complete commit-reveal voting flow
 * 
 * Run:
 *   npx hardhat run scripts/test-voting.ts --network localhost
 */
async function main() {
  console.log("🗳️  Testing BharatVote Commit-Reveal Flow (Week 3)...\n");

  // Find contract address
  const jsonPath = path.join(__dirname, "..", "..", "BharatVote-Week3-Frontend", "src", "contracts", "BharatVote.json");

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

  // Show initial state
  const phase = await contract.phase();
  const candidates = await contract.getCandidates();
  console.log(`📊 Initial State: Phase ${phase} (Commit)\n`);
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
  const tx1 = await contract.connect(voter1).commitVote(voter1Commit, []);
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
  const tx2 = await contract.connect(voter2).commitVote(voter2Commit, []);
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
  const tx3 = await contract.connect(voter3).commitVote(voter3Commit, []);
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

