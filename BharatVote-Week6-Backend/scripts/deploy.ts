import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import {
  loadDeploymentState,
  saveDeploymentState,
  verifyNetwork,
  verifyDeployerBalance,
  exportContractToFrontend,
  getContractABI,
  logToFile,
  DeploymentInfo,
} from "./utils/deployment-helpers";

/**
 * BharatVote Deployment Script (Week 6)
 *
 * Enhanced deployment with:
 * - Deployment state management
 * - Comprehensive logging
 * - Network verification
 * - No automatic candidate addition (admin adds via frontend)
 *
 * Run:
 *   npx hardhat run scripts/deploy.ts --network localhost
 */
async function main() {
  const startTime = Date.now();
  console.log("🚀 Starting BharatVote (Week 6) deployment...\n");
  logToFile("=== Deployment Started ===");

  try {
    // 1) Verify network connection
    const networkCheck = await verifyNetwork(31337n);
    const network = networkCheck.network;
    
    if (!networkCheck.isValid) {
      console.warn(
        `⚠️ Expected localhost (31337) but got ${network.chainId} (${network.name})`
      );
      logToFile(`Warning: Network mismatch - Expected 31337, got ${network.chainId}`);
    }
    
    console.log(
      `✓ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
    );
    logToFile(`Network: ${network.name} (${network.chainId})`);

    // 2) Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Deployer: ${deployer.address}`);
    logToFile(`Deployer: ${deployer.address}`);

    // 3) Verify deployer balance
    const balanceCheck = await verifyDeployerBalance(deployer.address, "0.1");
    console.log(`💰 Balance: ${balanceCheck.balance} ETH`);
    logToFile(`Balance: ${balanceCheck.balance} ETH`);

    if (!balanceCheck.isValid) {
      console.warn("⚠️ Low balance - deployment may fail");
      logToFile("Warning: Low balance detected");
    }
    console.log();

    // 4) Deploy contract
    console.log("📦 Deploying BharatVote...");
    logToFile("Deploying contract...");
    
    const BharatVoteFactory = await ethers.getContractFactory("BharatVote");
    const deployTx = await BharatVoteFactory.deploy();
    const deployReceipt = await deployTx.waitForDeployment();

    const address = await deployReceipt.getAddress();
    const deployTxResponse = deployTx.deploymentTransaction();
    const txHash = deployTxResponse?.hash || "unknown";
    
    console.log(`✅ Contract deployed at: ${address}`);
    console.log(`📝 Transaction: ${txHash}\n`);
    logToFile(`Contract deployed: ${address}`);
    logToFile(`Transaction: ${txHash}`);

    // 5) Verify admin
    const onchainAdmin = await deployReceipt.admin();
    console.log(`🔍 On-chain admin: ${onchainAdmin}`);
    logToFile(`Admin: ${onchainAdmin}`);

    if (onchainAdmin.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("✅ Admin verification passed\n");
      logToFile("Admin verification: PASSED");
    } else {
      console.log("⚠️ Admin mismatch – did you change the constructor?\n");
      logToFile("Admin verification: FAILED - Mismatch");
    }

    // 6)  Set Merkle root from eligibleVoters.json
    let merkleRoot: string | undefined;
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
          logToFile(`Found ${eligibleVoters.length} eligible voters`);

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

            merkleRoot = "0x" + tree.getRoot().toString("hex");
            const tx = await deployReceipt.setMerkleRoot(merkleRoot);
            const receipt = await tx.wait();
            
            console.log(`✅ Merkle root set on contract: ${merkleRoot}\n`);
            logToFile(`Merkle root set: ${merkleRoot}`);
          } catch (merkErr: any) {
            console.warn(
              "⚠️ merkletreejs not installed – skipping Merkle setup."
            );
            console.warn("   npm install merkletreejs");
            logToFile(`Merkle setup failed: ${merkErr.message}`);
          }
        } else {
          console.log(
            "ℹ️ eligibleVoters.json is empty – skipping Merkle setup.\n"
          );
          logToFile("eligibleVoters.json is empty");
        }
      } catch (fileErr: any) {
        console.warn(
          `⚠️ Could not read eligibleVoters.json: ${fileErr.message}`
        );
        logToFile(`Error reading eligibleVoters.json: ${fileErr.message}`);
      }
    } else {
      console.log(
        "ℹ️ eligibleVoters.json not found – skipping Merkle setup.\n"
      );
      logToFile("eligibleVoters.json not found");
    }

    // 7) Note: No automatic candidate addition
    // Admin will add candidates via the frontend admin panel
    console.log("ℹ️  Candidates: Admin can add candidates via frontend admin panel\n");
    logToFile("Candidates: To be added by admin via frontend");

    // 8) Export ABI + address to frontend
    const abi = getContractABI("BharatVote");
    const frontendTargets = [
      path.join(
        __dirname,
        "..",
        "..",
        "BharatVote-Week6-Frontend",
        "src",
        "contracts"
      ),
    ];

    const saved = exportContractToFrontend(address, abi, frontendTargets);
    console.log(`✓ Saved contract info to ${saved} frontend location(s)`);
    logToFile(`Exported to ${saved} frontend location(s)`);

    // 9) Save deployment state
    const deploymentInfo: DeploymentInfo = {
      contractAddress: address,
      deployerAddress: deployer.address,
      networkName: network.name,
      chainId: network.chainId.toString(),
      timestamp: new Date().toISOString(),
      merkleRoot,
      transactionHash: txHash,
    };

    saveDeploymentState(network.name, deploymentInfo);
    logToFile("Deployment state saved");

    // 10) Display summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ DEPLOYMENT COMPLETE (WEEK 6)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Contract Address: ${address}`);
    console.log(`Admin Address:    ${onchainAdmin}`);
    console.log(`Network:          ${network.name} (${network.chainId})`);
    console.log(`Merkle Root:      ${merkleRoot || "Not set"}`);
    console.log(`Candidates:       To be added by admin`);
    console.log(`Frontend Files:   ${saved} JSON file(s) updated`);
    console.log(`Duration:         ${duration}s\n`);
    console.log("Next Steps:");
    console.log("1. Use admin panel to add candidates");
    console.log("2. npm run verify             - Verify deployment");
    console.log("3. npm run deploy:demo        - Run demo deployment");
    console.log("4. Check deployments/ folder  - View deployment history\n");

    logToFile(`=== Deployment Completed in ${duration}s ===`);
  } catch (error: any) {
    console.error("❌ Deployment failed:", error);
    logToFile(`Deployment failed: ${error.message}`);
    logToFile(`Stack: ${error.stack}`);
    throw error;
  }
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
