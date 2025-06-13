import type { BytesLike } from "ethers";

/** Value returned by `makeCommit()` before committing */
export interface CommitBundle {
  /** bytes32 keccak256( abi.encode(choice, keccak256(salt)) ) */
  commit: BytesLike;
  /** plain-text salt – must be saved by user for Reveal phase */
  salt: string;
}

/** Specific reasons commit generation can fail */
export type CommitError = 
  | 'INVALID_CHOICE'
  | 'INVALID_SALT'
  | 'ENCODING_FAILED'
  | 'HASH_FAILED';
