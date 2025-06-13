import { ethers, BrowserProvider } from "ethers";
import BharatVote from "./contracts/BharatVote.json";
import type { BharatVoteContract } from "./types/contracts";

export const contractAddress: string = BharatVote.address;

export const getBharatVoteContract = async (): Promise<BharatVoteContract> => {
  if (!window.ethereum) {
    throw new Error("Ethereum wallet not detected.");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, BharatVote.abi, signer) as unknown as BharatVoteContract;
  return contract;
};
