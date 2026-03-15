import { describe, expect, it } from "vitest";
import { getNameLengthError, getUtf8ByteLength } from "./nameValidation";

describe("nameValidation", () => {
  it("accepts ASCII names within the contract byte limit", () => {
    expect(getNameLengthError("Student Council 2026", "Election name")).toBeNull();
  });

  it("rejects names over 100 UTF-8 bytes", () => {
    const longEmojiName = "😀".repeat(26);

    expect(getUtf8ByteLength(longEmojiName)).toBeGreaterThan(100);
    expect(getNameLengthError(longEmojiName, "Candidate name")).toBe("Candidate name must be 100 bytes or fewer.");
  });
});
