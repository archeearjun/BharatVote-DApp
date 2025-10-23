const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Quick Deploy - BharatVote");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy contract
  const BharatVote = await hre.ethers.getContractFactory("BharatVote");
  const contract = await BharatVote.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);
  
  // Set a simple merkle root (for testing)
  const merkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000001";
  await contract.setMerkleRoot(merkleRoot);
  console.log("✅ Merkle root set");
  
  // Save to frontend
  const artifactsPath = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(artifactsPath)) {
    fs.mkdirSync(artifactsPath, { recursive: true });
  }
  
  const contractData = {
    address: address,
    abi: JSON.parse(contract.interface.formatJson())
  };
  
  fs.writeFileSync(
    path.join(artifactsPath, "BharatVote.json"),
    JSON.stringify(contractData, null, 2)
  );
  
  console.log("✅ Contract ABI saved to frontend");
  console.log("🎉 Deployment complete!");
  
  // Test basic functionality
  try {
    const phase = await contract.phase();
    console.log("📊 Initial phase:", phase.toString());
    
    const admin = await contract.admin();
    console.log("👤 Admin address:", admin);
    
    console.log("🧪 Testing emergency reset...");
    const tx = await contract.emergencyReset();
    const receipt = await tx.wait();
    console.log("✅ Emergency reset successful!", receipt.hash);
    
  } catch (testErr) {
    console.log("⚠️  Test failed:", testErr.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
