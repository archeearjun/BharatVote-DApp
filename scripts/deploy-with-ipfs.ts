/**
 * Deployment script for BharatVoteWithIPFS contract
 * Deploys the contract and initializes it with IPFS data
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("\n🚀 Deploying BharatVoteWithIPFS Contract...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy the contract
    console.log("⏳ Deploying contract...");
    const BharatVoteWithIPFS = await ethers.getContractFactory("BharatVoteWithIPFS");
    const contract = await BharatVoteWithIPFS.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);

    // Load IPFS references from backend (if available)
    const ipfsReferencesPath = path.join(__dirname, "../backend/ipfs-references.json");
    let ipfsReferences = null;

    if (fs.existsSync(ipfsReferencesPath)) {
        ipfsReferences = JSON.parse(fs.readFileSync(ipfsReferencesPath, "utf8"));
        console.log("\n📦 Found IPFS references:");
        console.log(JSON.stringify(ipfsReferences, null, 2));
    } else {
        console.log("\n⚠️  No IPFS references found. You'll need to set them manually.");
        console.log("   Run the backend server first to generate IPFS data.");
    }

    // Calculate Merkle Root from eligible voters
    console.log("\n🌳 Calculating Merkle Root...");
    const eligibleVotersPath = path.join(__dirname, "../eligibleVoters.json");
    const eligibleVoters = JSON.parse(fs.readFileSync(eligibleVotersPath, "utf8"));

    const { MerkleTree } = require("merkletreejs");
    const { keccak256 } = ethers;

    const leaves = eligibleVoters.map((addr: string) =>
        keccak256(ethers.solidityPacked(["address"], [addr.toLowerCase()]))
    );
    const tree = new MerkleTree(leaves, keccak256, { sortLeaves: true, sortPairs: true });
    const merkleRoot = tree.getRoot();
    const merkleRootHex = "0x" + merkleRoot.toString("hex");

    console.log("✅ Merkle Root:", merkleRootHex);

    // Set Merkle Root on contract
    console.log("\n⏳ Setting Merkle Root on contract...");
    const setRootTx = await contract.setMerkleRoot(merkleRootHex);
    await setRootTx.wait();
    console.log("✅ Merkle Root set successfully!");

    // Set IPFS data on contract (if available)
    if (ipfsReferences) {
        if (ipfsReferences.kycDataHash) {
            console.log("\n⏳ Setting KYC Data IPFS hash...");
            const kycTx = await contract.setKYCDataIPFS(ipfsReferences.kycDataHash);
            await kycTx.wait();
            console.log("✅ KYC Data IPFS hash set:", ipfsReferences.kycDataHash);
        }

        if (ipfsReferences.voterListHash) {
            console.log("\n⏳ Setting Voter List IPFS hash...");
            const voterTx = await contract.setVoterListIPFS(ipfsReferences.voterListHash);
            await voterTx.wait();
            console.log("✅ Voter List IPFS hash set:", ipfsReferences.voterListHash);
        }
    }

    // Add sample candidates
    console.log("\n⏳ Adding sample candidates...");
    const candidates = [
        { name: "Candidate A", ipfs: "QmCandidateAManifesto" },
        { name: "Candidate B", ipfs: "QmCandidateBManifesto" },
        { name: "Candidate C", ipfs: "QmCandidateCManifesto" }
    ];

    for (const candidate of candidates) {
        const tx = await contract.addCandidate(candidate.name, candidate.ipfs);
        await tx.wait();
        console.log(`✅ Added: ${candidate.name} (IPFS: ${candidate.ipfs})`);
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        merkleRoot: merkleRootHex,
        ipfsReferences: ipfsReferences,
        candidates: candidates,
        timestamp: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber()
    };

    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }

    const filename = `deployment-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentPath, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ Deployment complete!");
    console.log("\n📋 Deployment Summary:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Merkle Root:", merkleRootHex);
    console.log("   Candidates Added:", candidates.length);
    if (ipfsReferences) {
        console.log("   KYC Data IPFS:", ipfsReferences.kycDataHash || "Not set");
        console.log("   Voter List IPFS:", ipfsReferences.voterListHash || "Not set");
    }
    console.log("   Deployment Info:", `deployments/${filename}`);

    console.log("\n🔗 Next Steps:");
    console.log("   1. Update your frontend with the contract address");
    console.log("   2. Verify the contract on Etherscan (if on public network)");
    console.log("   3. Test the voting flow with eligible addresses");
    console.log("   4. Monitor IPFS data availability\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });

