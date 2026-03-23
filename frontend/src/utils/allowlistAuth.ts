import { ethers } from "ethers";
import allowlistAuthSpec from "./allowlistAuthSpec.json";

const ALLOWLIST_MESSAGE_SEPARATOR = "\n";

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
    allowlistAuthSpec.title,
    `${allowlistAuthSpec.fields.election}: ${normalizedElectionAddress}`,
    `${allowlistAuthSpec.fields.addressesHash}: ${addressesHash}`,
    `${allowlistAuthSpec.fields.issuedAt}: ${issuedAt}`,
  ].join(ALLOWLIST_MESSAGE_SEPARATOR);
}
