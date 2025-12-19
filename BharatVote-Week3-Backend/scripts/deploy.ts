import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * BharatVote Deployment Script (Week 3)
 *
 * 1. Deploys BharatVote contract
 * 2. Sets Merkle root from eligibleVoters.json (if available)
 * 3. Adds sample candidates for testing
 * 4. Exports address + ABI for frontend
 *
 * Run:
 *   npx hardhat run scripts/deploy.ts --network localhost
 */
async function main() {
  console.log("🚀 Starting BharatVote (Week 3) deployment...\n");

  // 1) Check network connection
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  if (network.chainId !== 31337n) {
    console.warn(
      `⚠️ Expected localhost (31337) but got ${network.chainId} (${network.name})`
    );
  }
  console.log(
    `✓ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
  );

  // 2) Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Deployer: ${deployer.address}`);
  const balance = await provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // 3) Deploy contract
  console.log("📦 Deploying BharatVote...");
  const BharatVoteFactory = await ethers.getContractFactory("BharatVote");
  const bharatVote = await BharatVoteFactory.deploy();
  await bharatVote.waitForDeployment();

  const address = await bharatVote.getAddress();
  console.log(`✅ Contract deployed at: ${address}\n`);

  // 4) Verify admin
  const onchainAdmin = await bharatVote.admin();
  console.log(`🔍 On-chain admin: ${onchainAdmin}`);
  if (onchainAdmin.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ Admin verification passed\n");
  } else {
    console.log("⚠️ Admin mismatch – did you change the constructor?\n");
  }

  // 5) Optional: Set Merkle root from eligibleVoters.json
  const eligibleVotersPath = path.join(
    __dirname,
    "..",
    "..",
    "eligibleVoters.json"
  );
  if (fs.existsSync(eligibleVotersPath)) {
    try {
      const raw = fs.readFileSync(eligibleVotersPath, "utf8");
      const eligibleVoters = JSON.parse(raw);

      if (Array.isArray(eligibleVoters) && eligibleVoters.length > 0) {
        console.log(
          `📝 Found ${eligibleVoters.length} eligible voters – building Merkle root...`
        );

        try {
          const { MerkleTree } = await import("merkletreejs");
          const makeLeaf = (addr: string) =>
            Buffer.from(
              ethers
                .solidityPackedKeccak256(["address"], [addr.toLowerCase()])
                .slice(2),
              "hex"
            );

          const leaves = eligibleVoters.map((a: string) => makeLeaf(a));
          const tree = new MerkleTree(
            leaves,
            (data: Buffer) =>
              Buffer.from(ethers.keccak256(data).slice(2), "hex"),
            {
              sortLeaves: true,
              sortPairs: true,
            }
          );

          const merkleRoot = "0x" + tree.getRoot().toString("hex");
          const tx = await bharatVote.setMerkleRoot(merkleRoot);
          await tx.wait();

          console.log(`✅ Merkle root set on contract: ${merkleRoot}\n`);
        } catch (merkErr: any) {
          console.warn(
            "⚠️ merkletreejs not installed – skipping Merkle setup."
          );
          console.warn("   npm install merkletreejs");
        }
      } else {
        console.log(
          "ℹ️ eligibleVoters.json is empty – skipping Merkle setup.\n"
        );
      }
    } catch (fileErr: any) {
      console.warn(
        `⚠️ Could not read eligibleVoters.json: ${fileErr.message}`
      );
    }
  } else {
    console.log(
      "ℹ️ eligibleVoters.json not found – skipping Merkle setup.\n"
    );
  }

  // 6) Add sample candidates for testing
  console.log("👥 Adding sample candidates...");
  try {
    await bharatVote.addCandidate("Archee Arjun");
    await bharatVote.addCandidate("Shivangi Priya");
    await bharatVote.addCandidate("Mohd Sultan");
    await bharatVote.addCandidate("Keshav Gupta");
    console.log("✅ Added 4 sample candidates\n");
  } catch (err: any) {
    console.warn(`⚠️ Could not add candidates: ${err.message}\n`);
  }

  // 7) Export ABI + address to frontend
  const abi = JSON.parse(bharatVote.interface.formatJson());
  const contractData = { address, abi };

  const frontendTargets = [
    path.join(
      __dirname,
      "..",
      "..",
      "BharatVote-Week3-Frontend",
      "src",
      "contracts"
    ),
  ];

  let saved = 0;
  for (const target of frontendTargets) {
    try {
      fs.mkdirSync(target, { recursive: true });
      const outFile = path.join(target, "BharatVote.json");
      fs.writeFileSync(outFile, JSON.stringify(contractData, null, 2));
      console.log(`✓ Saved contract info to: ${outFile}`);
      saved++;
    } catch (writeErr: any) {
      console.warn(`⚠️ Could not write to ${target}: ${writeErr.message}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEPLOYMENT COMPLETE (WEEK 3)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Contract Address: ${address}`);
  console.log(`Admin Address:    ${onchainAdmin}`);
  console.log(`Network:          ${network.name} (${network.chainId})`);
  console.log(`Candidates:       4 sample candidates added`);
  console.log(`Frontend Files:   ${saved} JSON file(s) updated\n`);
  console.log("Next:");
  console.log("1. npm run verify             - Verify deployment");
  console.log("2. npm run test-vote          - Test voting flow");
  console.log("3. npx hardhat console --network localhost  - Interactive testing");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});

