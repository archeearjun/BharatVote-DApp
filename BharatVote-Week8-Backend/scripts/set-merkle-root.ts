import { ethers, artifacts } from "hardhat";

// Fetch the Merkle root from backend and set it on-chain.
// Usage:
// BACKEND_URL=http://localhost:3001 CONTRACT_ADDRESS=0x... npx hardhat run scripts/set-merkle-root.ts --network localhost

async function main() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS env var is required");
  }

  const resp = await fetch(`${backendUrl}/api/merkle-root`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch merkle root from backend: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  const merkleRoot: string | undefined = data?.merkleRoot;

  if (!merkleRoot || merkleRoot === "0x") {
    throw new Error("Backend returned an invalid merkle root");
  }

  const [signer] = await ethers.getSigners();
  const artifact = await artifacts.readArtifact("BharatVote");
  const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

  console.log(`Setting merkle root to ${merkleRoot} on contract ${contractAddress} as ${signer.address}`);
  const tx = await contract.setMerkleRoot(merkleRoot);
  await tx.wait();
  console.log(`Merkle root set. tx=${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
