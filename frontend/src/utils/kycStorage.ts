import { ethers } from "ethers";

const DEFAULT_KYC_SCOPE = "global";

function normalizeScope(value?: string) {
  if (!value) return DEFAULT_KYC_SCOPE;

  try {
    return ethers.getAddress(value).toLowerCase();
  } catch {
    const normalized = String(value).trim().toLowerCase();
    return normalized || DEFAULT_KYC_SCOPE;
  }
}

function getLegacyKycStorageKey(account: string) {
  return `bv_kyc_${String(account).toLowerCase()}`;
}

function normalizeRoot(root?: string | null) {
  if (!root) return null;
  const trimmed = String(root).trim();
  return ethers.isHexString(trimmed, 32) ? trimmed.toLowerCase() : null;
}

export function getKycStorageKey(account: string, electionAddress?: string) {
  return `${getLegacyKycStorageKey(account)}_${normalizeScope(electionAddress)}`;
}

export function setStoredKycVerification(
  account: string,
  electionAddress: string | undefined,
  voterId: string,
  eligibilityRoot?: string | null
) {
  const key = getKycStorageKey(account, electionAddress);
  const legacyKey = getLegacyKycStorageKey(account);
  const normalizedRoot = normalizeRoot(eligibilityRoot);

  localStorage.setItem(key, "1");
  localStorage.setItem(`${key}_id`, voterId);
  if (normalizedRoot) {
    localStorage.setItem(`${key}_root`, normalizedRoot);
  } else {
    localStorage.removeItem(`${key}_root`);
  }

  // Remove the old account-wide flag so verification cannot leak across elections.
  localStorage.removeItem(legacyKey);
  localStorage.removeItem(`${legacyKey}_id`);
  localStorage.removeItem(`${legacyKey}_root`);
}

export function getStoredKycVerification(
  account: string,
  electionAddress?: string,
  currentEligibilityRoot?: string | null
) {
  const key = getKycStorageKey(account, electionAddress);
  const isVerified = localStorage.getItem(key) === "1";
  const voterId = localStorage.getItem(`${key}_id`);
  const storedEligibilityRoot = localStorage.getItem(`${key}_root`);
  const normalizedCurrentRoot = normalizeRoot(currentEligibilityRoot);

  if (normalizedCurrentRoot && storedEligibilityRoot !== normalizedCurrentRoot) {
    return { isVerified: false, voterId: null };
  }

  return { isVerified, voterId };
}
