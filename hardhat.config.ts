import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: { artifacts: "artifacts", cache: "cache", sources: "contracts", tests: "test" },

};

export default config;
