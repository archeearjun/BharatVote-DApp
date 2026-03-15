import { ethers } from "ethers";

export function normalizeAllowlistAddresses(addresses: string[]) {
  return Array.from(
    new Set(
      addresses
        .filter((address) => ethers.isAddress(address))
        .map((address) => ethers.getAddress(address))
    )
  );
}

export function hashAllowlistAddresses(addresses: string[]) {
  return ethers.keccak256(
    ethers.toUtf8Bytes(normalizeAllowlistAddresses(addresses).join("\n"))
  );
}

export function buildAllowlistUploadMessage(
  electionAddress: string,
  addresses: string[],
  issuedAt: number
) {
  const normalizedElectionAddress = ethers.getAddress(electionAddress);
  const addressesHash = hashAllowlistAddresses(addresses);

  return [
    "BharatVote Admin Allowlist Upload",
    `Election: ${normalizedElectionAddress}`,
    `Addresses Hash: ${addressesHash}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}
