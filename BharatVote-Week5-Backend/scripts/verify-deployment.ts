import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verification Script (Week 3)
 * 
 * Checks if contract is deployed and reads current state
 * 
 * Run:
 *   npx hardhat run scripts/verify-deployment.ts --network localhost
 */
async function main() {
  console.log("🔍 Verifying BharatVote deployment...\n");

  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Try to find contract address from frontend JSON files
  const jsonPaths = [
    path.join(__dirname, "..", "..", "BharatVote-Week3-Frontend", "src", "contracts", "BharatVote.json"),
  ];

  let contractAddress: string | null = null;
  for (const jsonPath of jsonPaths) {
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        if (data.address) {
          contractAddress = data.address;
          console.log(`✓ Found contract address: ${contractAddress}`);
          console.log(`  (from ${jsonPath})\n`);
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
  }

  if (!contractAddress) {
    console.log("❌ Could not find deployed contract address.");
    console.log("   Run: npm run deploy");
    return;
  }

  // Check if contract exists at address
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    console.log("❌ No contract bytecode at address:", contractAddress);
    console.log("   Contract may not be deployed. Run: npm run deploy");
    return;
  }

  console.log("✅ Contract bytecode exists at address\n");

  // Connect to contract and read state
  try {
    const contract = await ethers.getContractAt("BharatVote", contractAddress);

    const admin = await contract.admin();
    const phase = await contract.phase();
    const candidateCount = await contract.candidateCount();
    const voterCount = await contract.getVoterCount();
    const merkleRoot = await contract.merkleRoot();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 CONTRACT STATE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Admin:           ${admin}`);
    console.log(`Phase:           ${phase} (${getPhaseLabel(phase)})`);
    console.log(`Candidates:      ${candidateCount}`);
    console.log(`Voters:          ${voterCount} committed`);
    console.log(`Merkle Root:     ${merkleRoot}`);

    // Show candidates if any
    if (candidateCount > 0n) {
      console.log("\n👥 Candidates:");
      const candidates = await contract.getCandidates();
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const status = c.isActive ? "✅ Active" : "❌ Inactive";
        console.log(`   [${i}] ${c.name} - ${status}`);
      }
    }

    // Show vote tally if any
    if (voterCount > 0n) {
      console.log("\n🗳️  Vote Tally:");
      const tally = await contract.getTally();
      for (let i = 0; i < tally.length; i++) {
        console.log(`   Candidate ${i}: ${tally[i]} votes`);
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ RESULT: Contract is DEPLOYED and accessible");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err: any) {
    console.log("❌ Error reading contract state:", err.message);
    console.log("   Contract may not be the correct version.");
  }
}

function getPhaseLabel(phase: bigint): string {
  if (phase === 0n) return "Commit Phase";
  if (phase === 1n) return "Reveal Phase";
  if (phase === 2n) return "Finished";
  return "Unknown";
}

main().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

