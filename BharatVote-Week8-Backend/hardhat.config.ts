import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    // Mainnet (for production demos - be careful!)
    mainnet: {
      url: process.env.MAINNET_URL || "https://mainnet.infura.io/v3/YOUR-PROJECT-ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  // Etherscan verification
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;
