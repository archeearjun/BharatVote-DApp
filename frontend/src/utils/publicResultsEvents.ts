import { ethers } from 'ethers';

const ABI_WORD_HEX_LENGTH = 64;

export function decodeVoteRevealedChoiceFromLogData(
  data: string,
  abiCoder: ethers.AbiCoder
): number | null {
  if (!data || data === '0x') return null;
  const hex = data.startsWith('0x') ? data.slice(2) : data;
  if (hex.length % ABI_WORD_HEX_LENGTH !== 0) return null;

  const wordCount = hex.length / ABI_WORD_HEX_LENGTH;

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
