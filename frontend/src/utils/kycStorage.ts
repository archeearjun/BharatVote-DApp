import { ethers } from "ethers";

function normalizeScope(value?: string) {
  if (!value) return "global";

  try {
    return ethers.getAddress(value).toLowerCase();
  } catch {
    const normalized = String(value).trim().toLowerCase();
    return normalized || "global";
  }
}

function getLegacyKycStorageKey(account: string) {
  return `bv_kyc_${String(account).toLowerCase()}`;
}

export function getKycStorageKey(account: string, electionAddress?: string) {
  return `${getLegacyKycStorageKey(account)}_${normalizeScope(electionAddress)}`;
}

export function setStoredKycVerification(account: string, electionAddress: string | undefined, voterId: string) {
  const key = getKycStorageKey(account, electionAddress);
  const legacyKey = getLegacyKycStorageKey(account);

  localStorage.setItem(key, "1");
  localStorage.setItem(`${key}_id`, voterId);

  // Remove the old account-wide flag so verification cannot leak across elections.
  localStorage.removeItem(legacyKey);
  localStorage.removeItem(`${legacyKey}_id`);
}

export function getStoredKycVerification(account: string, electionAddress?: string) {
  const key = getKycStorageKey(account, electionAddress);
  const isVerified = localStorage.getItem(key) === "1";
  const voterId = localStorage.getItem(`${key}_id`);

  return { isVerified, voterId };
}
