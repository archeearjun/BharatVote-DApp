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
 * BharatVote Demo Deployment Script (Week 6)
 *
 * Quick deployment script optimized for demonstrations.
 * Sets up Merkle root automatically if eligibleVoters.json exists.
 * No automatic candidate addition - admin adds via frontend.
 *
 * Run:
 *   npx hardhat run scripts/deploy-demo.ts --network localhost
 */
async function main() {
  const startTime = Date.now();
  console.log("🎬 Starting BharatVote Demo Deployment (Week 6)...\n");
  logToFile("=== Demo Deployment Started ===");

  try {
    // 1) Verify network
    const networkCheck = await verifyNetwork(31337n);
    const network = networkCheck.network;
    
    console.log(
      `✓ Network: ${network.name} (Chain ID: ${network.chainId})`
    );
    logToFile(`Network: ${network.name} (${network.chainId})`);

    // 2) Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Deployer: ${deployer.address}`);
    logToFile(`Deployer: ${deployer.address}`);

    // 3) Check balance
    const balanceCheck = await verifyDeployerBalance(deployer.address, "0.1");
    console.log(`💰 Balance: ${balanceCheck.balance} ETH\n`);
    logToFile(`Balance: ${balanceCheck.balance} ETH`);

    // 4) Deploy contract
    console.log("📦 Deploying contract...");
    logToFile("Deploying contract...");
    
    const BharatVoteFactory = await ethers.getContractFactory("BharatVote");
    const bharatVote = await BharatVoteFactory.deploy();
    await bharatVote.waitForDeployment();

    const address = await bharatVote.getAddress();
    const deployTxResponse = bharatVote.deploymentTransaction();
    const txHash = deployTxResponse?.hash || "unknown";
    
    console.log(`✅ Contract deployed: ${address}\n`);
    logToFile(`Contract deployed: ${address}`);

    // 5) Verify admin
    const onchainAdmin = await bharatVote.admin();
    console.log(`🔍 Admin: ${onchainAdmin}`);
    logToFile(`Admin: ${onchainAdmin}`);

    // 6) Set Merkle root if eligibleVoters.json exists
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
          console.log(`📝 Setting up Merkle root for ${eligibleVoters.length} voters...`);
          logToFile(`Setting Merkle root for ${eligibleVoters.length} voters`);

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
          const tx = await bharatVote.setMerkleRoot(merkleRoot);
          await tx.wait();
          
          console.log(`✅ Merkle root set: ${merkleRoot}\n`);
          logToFile(`Merkle root: ${merkleRoot}`);
        }
      } catch (err: any) {
        console.warn(`⚠️ Could not set Merkle root: ${err.message}\n`);
        logToFile(`Merkle root setup failed: ${err.message}`);
      }
    }

    // 7) Export to frontend
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

    exportContractToFrontend(address, abi, frontendTargets);
    console.log("✓ Contract info exported to frontend");

    // 8) Save deployment state
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

    // 9) Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ DEMO DEPLOYMENT COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Contract: ${address}`);
    console.log(`Admin:    ${onchainAdmin}`);
    console.log(`Duration: ${duration}s\n`);
    console.log("📋 Next Steps:");
    console.log("   1. Open frontend admin panel");
    console.log("   2. Add candidates");
    console.log("   3. Start election\n");

    logToFile(`=== Demo Deployment Completed in ${duration}s ===`);
  } catch (error: any) {
    console.error("❌ Demo deployment failed:", error);
    logToFile(`Demo deployment failed: ${error.message}`);
    throw error;
  }
}

main().catch((err) => {
  console.error("❌ Demo deployment failed:", err);
  process.exit(1);
});

