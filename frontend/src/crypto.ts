import { AbiCoder, keccak256, randomBytes, hexlify, toUtf8Bytes, type BytesLike } from "ethers";
import type { CommitBundle, CommitError } from "./types/crypto";

/**
 * Build the commit hash for a vote using the commit-reveal scheme.
 *
 * @param choice - The candidate ID the voter is selecting (must be non-negative)
 * @param salt - Optional salt; if omitted a cryptographically-random one is created
 * @throws {Error} If choice is negative or not a number
 * @returns {CommitBundle} Object containing commit hash and salt
 */
export function makeCommit(choice: number, salt?: string): CommitBundle {
  // Validate input
  if (typeof choice !== 'number' || choice < 0 || !Number.isInteger(choice)) {
    throw new Error('INVALID_CHOICE' as CommitError);
  }

  try {
    // Generate or validate salt
    const plainSalt = salt ?? hexlify(randomBytes(32));
    
    if (!plainSalt || plainSalt.length === 0) {
      throw new Error('INVALID_SALT' as CommitError);
    }

    // Create hash of salt first
    const saltHash = keccak256(toUtf8Bytes(plainSalt));

    // Encode choice and salt hash together
    const encoded = new AbiCoder().encode(
      ["uint256", "bytes32"],
      [choice, saltHash]
    );

    // Create final commit hash
    const commit = keccak256(encoded);

    return { 
      commit, 
      salt: plainSalt 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'HASH_FAILED';
    throw new Error(errorMessage as CommitError);
  }
}

/**
 * Verify if a commit matches a choice and salt combination.
 * 
 * @param commit - The original commit hash
 * @param choice - The candidate choice to verify
 * @param salt - The salt used in the original commit
 * @returns {boolean} True if the commit matches the choice and salt
 */
export function verifyCommit(commit: BytesLike, choice: number, salt: string): boolean {
  try {
    const { commit: reconstructedCommit } = makeCommit(choice, salt);
    return commit === reconstructedCommit;
  } catch {
    return false;
  }
}