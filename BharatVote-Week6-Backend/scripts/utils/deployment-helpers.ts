import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

export interface DeploymentInfo {
  contractAddress: string;
  deployerAddress: string;
  networkName: string;
  chainId: string;
  timestamp: string;
  merkleRoot?: string;
  gasUsed?: string;
  blockNumber?: number;
  transactionHash?: string;
}

export interface DeploymentState {
  deployments: DeploymentInfo[];
  latest?: DeploymentInfo;
}

/**
 * Get deployment state file path
 */
export function getDeploymentStatePath(networkName: string): string {
  const deploymentsDir = path.join(__dirname, "..", "..", "deployments", networkName);
  fs.mkdirSync(deploymentsDir, { recursive: true });
  return path.join(deploymentsDir, "deployment-state.json");
}

/**
 * Load deployment state from file
 */
export function loadDeploymentState(networkName: string): DeploymentState {
  const statePath = getDeploymentStatePath(networkName);
  
  if (!fs.existsSync(statePath)) {
    return { deployments: [] };
  }

  try {
    const content = fs.readFileSync(statePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️ Could not load deployment state: ${error}`);
    return { deployments: [] };
  }
}

/**
 * Save deployment state to file
 */
export function saveDeploymentState(
  networkName: string,
  deployment: DeploymentInfo
): void {
  const state = loadDeploymentState(networkName);
  
  state.deployments.push(deployment);
  state.latest = deployment;

  const statePath = getDeploymentStatePath(networkName);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  
  // Also save individual deployment file
  const deploymentDir = path.join(__dirname, "..", "..", "deployments", networkName);
  const deploymentFile = path.join(
    deploymentDir,
    `deployment-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
}

/**
 * Get log file path
 */
export function getLogPath(): string {
  const logsDir = path.join(__dirname, "..", "..", "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const today = new Date().toISOString().split("T")[0];
  return path.join(logsDir, `deployment-${today}.log`);
}

/**
 * Log message to file
 */
export function logToFile(message: string): void {
  const logPath = getLogPath();
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
}

/**
 * Verify network connection
 */
export async function verifyNetwork(expectedChainId?: bigint): Promise<{
  network: any;
  isValid: boolean;
}> {
  const provider = ethers.getDefaultProvider();
  const network = await provider.getNetwork();

  if (expectedChainId && network.chainId !== expectedChainId) {
    return {
      network,
      isValid: false,
    };
  }

  return {
    network,
    isValid: true,
  };
}

/**
 * Verify deployer balance
 */
export async function verifyDeployerBalance(
  address: string,
  minBalance: string = "0.1"
): Promise<{ balance: string; isValid: boolean }> {
  const provider = ethers.getDefaultProvider();
  const balance = await provider.getBalance(address);
  const balanceEth = ethers.formatEther(balance);
  const minBalanceWei = ethers.parseEther(minBalance);

  return {
    balance: balanceEth,
    isValid: balance >= minBalanceWei,
  };
}

/**
 * Export contract ABI and address to frontend
 */
export function exportContractToFrontend(
  contractAddress: string,
  abi: any[],
  frontendPaths: string[]
): number {
  const contractData = {
    address: contractAddress,
    abi,
  };

  let saved = 0;
  for (const targetPath of frontendPaths) {
    try {
      fs.mkdirSync(targetPath, { recursive: true });
      const outFile = path.join(targetPath, "BharatVote.json");
      fs.writeFileSync(outFile, JSON.stringify(contractData, null, 2));
      saved++;
    } catch (error: any) {
      console.warn(`⚠️ Could not write to ${targetPath}: ${error.message}`);
    }
  }

  return saved;
}

/**
 * Get contract ABI from artifacts
 */
export function getContractABI(contractName: string = "BharatVote"): any[] {
  const artifactsPath = path.join(
    __dirname,
    "..",
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactsPath)) {
    console.warn(`⚠️ Artifacts not found at ${artifactsPath}`);
    return [];
  }

  try {
    const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
    return artifact.abi || [];
  } catch (error) {
    console.warn(`⚠️ Could not read ABI: ${error}`);
    return [];
  }
}

