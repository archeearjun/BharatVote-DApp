import { ethers } from 'ethers';
import BharatVote from '../contracts/BharatVote.json';

export type BharatVoteContract = ethers.Contract;

export function getJsonRpcProvider(): ethers.JsonRpcProvider {
  // Android emulator loopback to host
  return new ethers.JsonRpcProvider('http://10.0.2.2:8545');
}

export async function getBharatVoteContract(): Promise<BharatVoteContract> {
  const provider = getJsonRpcProvider();
  const address: string = (BharatVote as any).address;
  const abi: any = (BharatVote as any).abi;
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
}

export async function getReadOnlyContract(): Promise<BharatVoteContract> {
  const provider = getJsonRpcProvider();
  const address: string = (BharatVote as any).address;
  const abi: any = (BharatVote as any).abi;
  return new ethers.Contract(address, abi, provider);
}

export async function solidityPackedKeccak256(types: readonly string[], values: readonly any[]): Promise<string> {
  return ethers.solidityPackedKeccak256(types, values);
}


