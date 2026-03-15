import { beforeEach, describe, expect, it } from "vitest";
import { getKycStorageKey, getStoredKycVerification, setStoredKycVerification } from "./kycStorage";

describe("kycStorage", () => {
  const account = "0x01bad59740664445Fd489315E14F4300639c253b";
  const electionA = "0x1111111111111111111111111111111111111111";
  const electionB = "0x2222222222222222222222222222222222222222";

  beforeEach(() => {
    localStorage.clear();
  });

  it("scopes stored verification by election address", () => {
    setStoredKycVerification(account, electionA, "VOTER-A");

    expect(getStoredKycVerification(account, electionA)).toEqual({
      isVerified: true,
      voterId: "VOTER-A",
    });

    expect(getStoredKycVerification(account, electionB)).toEqual({
      isVerified: false,
      voterId: null,
    });
  });

  it("normalizes the storage key for the same election address", () => {
    const lower = getKycStorageKey(account, electionA.toLowerCase());
    const upper = getKycStorageKey(account, electionA.toUpperCase());

    expect(lower).toBe(upper);
  });
});
