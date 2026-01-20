import * as fs from "fs";
import * as path from "path";
import { MerkleTree } from 'merkletreejs';
import eligibleVoters from "../eligibleVoters.json";

declare const ethers: any;

const keccak256Hasher = (data: string | Buffer) => {
  if (typeof data === 'string') {
      return Buffer.from(ethers.solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
  } else if (Buffer.isBuffer(data)) {
      return Buffer.from(ethers.keccak256(data).substring(2), 'hex');
  } else {
      throw new Error("Invalid data type for keccak256Hasher: Expected string or Buffer");
  }
};

async function main() {
  console.log("🚀 Deploying BharatVote for Demo...");
  
  // Get the signer accounts
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
    return;
  }

  console.log("\n📋 Deploying BharatVote contract...");
  const BharatVoteFactory = await ethers.getContractFactory("BharatVote");
  const implementation = await BharatVoteFactory.deploy();
  await implementation.waitForDeployment();

  // BharatVote is designed to be used via Clones + initialize(...).
  // Create an initialized clone election instance via ElectionFactory.
  const ElectionFactoryFactory = await ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactoryFactory.deploy(await implementation.getAddress());
  await electionFactory.waitForDeployment();

  const createTx = await electionFactory.createElection("BharatVote Demo");
  const receipt = await createTx.wait();
  const created = receipt?.logs
    .map((log: any) => {
      try {
        return electionFactory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed?.name === "ElectionCreated");

  if (!created) {
    throw new Error("ElectionCreated event not found");
  }

  const bharatVote = BharatVoteFactory.attach(created.args.election);

  const address = await bharatVote.getAddress();
  console.log(`✅ Contract deployed at: ${address}`);

  // Verify the admin address
  const contractAdmin = await bharatVote.admin();
  console.log(`👑 Contract admin: ${contractAdmin}`);

  // Set Merkle Root
  const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
  const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  const merkleRoot = '0x' + tree.getRoot().toString('hex');

  console.log(`🌳 Setting Merkle Root: ${merkleRoot}`);
  const setMerkleRootTx = await bharatVote.setMerkleRoot(merkleRoot);
  await setMerkleRootTx.wait();
  console.log("✅ Merkle Root set");

  // Add some demo candidates
  console.log("\n👥 Adding demo candidates...");
  const candidates = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"];
  
  for (const candidate of candidates) {
    const tx = await bharatVote.addCandidate(candidate);
    await tx.wait();
    console.log(`✅ Added candidate: ${candidate}`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: address,
    adminAddress: contractAdmin,
    merkleRoot: merkleRoot,
    candidates: candidates,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    transactionHash: bharatVote.deploymentTransaction()?.hash
  };

  // Save to frontend
  const artifactsPath = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(artifactsPath)) fs.mkdirSync(artifactsPath, { recursive: true });

  fs.writeFileSync(
    path.join(artifactsPath, "BharatVote.json"),
    JSON.stringify(
      {
        address,
        abi: JSON.parse(bharatVote.interface.formatJson()),
      },
      null,
      2
    )
  );

  // Save deployment info
  fs.writeFileSync(
    path.join(__dirname, "..", "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Demo deployment complete!");
  console.log("📱 Frontend contract address updated");
  console.log("📄 Deployment info saved to deployment-info.json");
  console.log("\n🔗 Contract Explorer Links:");

  if (network.chainId === 1n) { // Mainnet
    console.log(`🌐 Etherscan: https://etherscan.io/address/${address}`);
  }
  
  console.log("\n💡 Next steps:");
  console.log("1. Update your frontend environment variables");
  console.log("2. Share the contract address with your demo audience");
  console.log("3. They can connect their wallets to the same network");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});

