import { ethers } from "ethers";

// returns { commit: string, salt: string }
export function makeCommit(candidateId: number) {
  const saltBytes = ethers.randomBytes(32);      // random 32-byte salt
  const saltHex = ethers.hexlify(saltBytes);     // convert to hex string
  const commit = ethers.solidityPackedKeccak256(
    ["uint256", "bytes32"],
    [candidateId, saltHex]
  );
  return { commit, salt: saltHex };
}
