// import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { setupPorts } from "./utils/killPorts";
import { MerkleTree } from 'merkletreejs';
import eligibleVoters from "../eligibleVoters.json";

declare const ethers: any; // Declare ethers as a global variable to satisfy TypeScript

// This function will be passed to MerkleTree constructor as the hashing algorithm.
// It should receive Buffer inputs from MerkleTree's internal operations and return a Buffer.
// It also handles initial string addresses for leaf creation by passing them directly to keccak256.
const keccak256Hasher = (data: string | Buffer) => {
  if (typeof data === 'string') {
      // For leaves (addresses), hash them using solidityPackedKeccak256 to match contract's abi.encodePacked
      return Buffer.from(ethers.solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
  } else if (Buffer.isBuffer(data)) {
      // If data is a Buffer (from MerkleTree internal operations), hash it using keccak256
      return Buffer.from(ethers.keccak256(data).substring(2), 'hex');
  } else {
      throw new Error("Invalid data type for keccak256Hasher: Expected string or Buffer");
  }
};

async function main() {
  console.log("🛠️  Checking environment...");
  await new Promise((r) => setTimeout(r, 2000));
  await setupPorts();
  console.log("✓ Environment OK");

  // Get the signer accounts
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // Check if this matches the expected admin address
  const expectedAdmin = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  console.log("🎯 Expected admin address:", expectedAdmin);
  console.log("✅ Admin address match:", deployer.address.toLowerCase() === expectedAdmin.toLowerCase());

  console.log("\n🚀 Deploying BharatVote...");
  const BharatVoteFactory = await ethers.getContractFactory("BharatVote");
  const implementation = await BharatVoteFactory.deploy();
  await implementation.waitForDeployment();

  // BharatVote is designed to be used via Clones + initialize(...).
  // Create an initialized clone election instance via ElectionFactory.
  const ElectionFactoryFactory = await ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactoryFactory.deploy(await implementation.getAddress());
  await electionFactory.waitForDeployment();

  const createTx = await electionFactory.createElection("BharatVote");
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
  console.log(`✓ Election deployed at: ${address}`);

  // Verify the admin address in the deployed election
  const contractAdmin = await bharatVote.admin();
  console.log(`🔍 Contract admin address: ${contractAdmin}`);
  console.log(`✅ Admin verification: ${contractAdmin.toLowerCase() === expectedAdmin.toLowerCase()}`);

  // Calculate Merkle Root dynamically
  const leaves = eligibleVoters.map(addr => keccak256Hasher(addr.toLowerCase()));
  const tree = new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  const merkleRoot = '0x' + tree.getRoot().toString('hex');

  console.log(`Setting Merkle Root on contract: ${merkleRoot}`);
  const setMerkleRootTx = await bharatVote.setMerkleRoot(merkleRoot);
  await setMerkleRootTx.wait();
  console.log("✓ Merkle Root set on contract.");

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

  console.log("✓ ABI + Address saved to frontend");
}

main().catch((err) => {
  if (err instanceof Error && err.message.includes("Hardhat node is not running")) {
    console.error("❌ Please run `npx hardhat node` before deployment.");
  } else {
    console.error("❌ Deployment failed:", err);
  }
  process.exit(1);
});
