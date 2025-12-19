import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Quick script to check the current phase of the deployed contract
 */
async function main() {
  console.log("🔍 Checking contract phase...\n");

  // Find contract address
  const jsonPath = path.join(
    __dirname,
    "..",
    "..",
    "BharatVote-Week3-Frontend",
    "src",
    "contracts",
    "BharatVote.json"
  );

  if (!fs.existsSync(jsonPath)) {
    console.log("❌ Contract JSON not found. Run: npm run deploy");
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const contractAddress = data.address;

  console.log(`📍 Contract Address: ${contractAddress}\n`);

  // Connect to contract
  const contract = await ethers.getContractAt("BharatVote", contractAddress);

  // Check phase
  const phase = await contract.phase();
  const phaseNumber = Number(phase);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 CONTRACT STATE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Phase: ${phaseNumber}`);
  
  if (phaseNumber === 0) {
    console.log("✅ Phase: COMMIT (0) - Ready for voting!");
  } else if (phaseNumber === 1) {
    console.log("⚠️  Phase: REVEAL (1) - Votes can be revealed");
  } else if (phaseNumber === 2) {
    console.log("❌ Phase: FINISHED (2) - Election complete");
    console.log("\n💡 To reset: Restart Hardhat node and redeploy");
  }

  // Check candidates
  const candidateCount = await contract.candidateCount();
  console.log(`Candidates: ${candidateCount}`);

  // Check voters
  const voterCount = await contract.getVoterCount();
  console.log(`Voters: ${voterCount}`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err) => {
  console.error("❌ Check failed:", err);
  process.exit(1);
});









