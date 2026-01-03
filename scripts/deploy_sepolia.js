require("dotenv").config();

const hre = require("hardhat");

async function main() {
  const { PRIVATE_KEY, VITE_SEPOLIA_RPC_URL } = process.env;
  if (!PRIVATE_KEY) throw new Error("Missing env var: PRIVATE_KEY");
  if (!VITE_SEPOLIA_RPC_URL) throw new Error("Missing env var: VITE_SEPOLIA_RPC_URL");

  const { ethers } = hre;

  const provider = new ethers.JsonRpcProvider(VITE_SEPOLIA_RPC_URL);
  const normalizedPrivateKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
  const deployer = new ethers.Wallet(normalizedPrivateKey, provider);

  const BharatVote = await ethers.getContractFactory("BharatVote", deployer);
  const logic = await BharatVote.deploy();
  await logic.waitForDeployment();
  const logicAddress = await logic.getAddress();

  const ElectionFactory = await ethers.getContractFactory("ElectionFactory", deployer);
  const factory = await ElectionFactory.deploy(logicAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("BharatVote (Logic):", logicAddress);
  console.log("ElectionFactory:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
