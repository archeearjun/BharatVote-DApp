import { ethers, type Signer } from "ethers";
import { ElectionFactory__factory } from "@typechain/factories/contracts/ElectionFactory.sol/ElectionFactory__factory";
import { BharatVote__factory } from "@typechain/factories/contracts/BharatVote.sol/BharatVote__factory";

const FALLBACK_FACTORY_ADDRESS = "0xE09a5D002a6a27e278fE885f12F110e4a5f35bb1";

export function getFactoryAddress(): string {
  return (import.meta.env.VITE_FACTORY_ADDRESS as string | undefined) || FALLBACK_FACTORY_ADDRESS;
}

export function getFactoryContract(signer: Signer) {
  const factoryAddress = getFactoryAddress();
  if (!ethers.isAddress(factoryAddress)) {
    throw new Error(`Invalid VITE_FACTORY_ADDRESS: ${factoryAddress}`);
  }
  return ElectionFactory__factory.connect(factoryAddress, signer);
}

export function getElectionContract(address: string, signer: Signer) {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid election address: ${address}`);
  }
  return BharatVote__factory.connect(address, signer);
}

