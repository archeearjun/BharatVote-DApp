import { ethers } from 'ethers';

export function decodeVoteRevealedChoiceFromLogData(
  data: string,
  abiCoder: ethers.AbiCoder
): number | null {
  if (!data || data === '0x') return null;
  const hex = data.startsWith('0x') ? data.slice(2) : data;
  if (hex.length % 64 !== 0) return null;

  const wordCount = hex.length / 64;

  try {
    if (wordCount >= 2) {
      const decoded = abiCoder.decode(['uint256', 'uint256'], data);
      return Number(decoded?.[0]);
    }
  } catch {
    // fall through
  }

  try {
    const decoded = abiCoder.decode(['uint256'], data);
    return Number(decoded?.[0]);
  } catch {
    return null;
  }
}

