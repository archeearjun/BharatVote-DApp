import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Admin from "../Admin";

// Mock i18n to avoid provider wiring
vi.mock("../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockSetMerkleRoot = vi.fn(() => ({
  wait: vi.fn().mockResolvedValue({}),
}));

const mockContract = {
  getCandidates: vi.fn().mockResolvedValue([]),
  candidateCount: vi.fn().mockResolvedValue(0n),
  setMerkleRoot: mockSetMerkleRoot,
};

describe("Admin merkle root helpers", () => {
  beforeEach(() => {
    mockSetMerkleRoot.mockClear();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ merkleRoot: `0x${"a".repeat(64)}` }),
    });

    // Ensure the component sees our mocked fetch regardless of which global it uses.
    (globalThis as any).fetch = fetchMock;
    (window as any).fetch = fetchMock;
  });

  it("fetches merkle root and calls setMerkleRoot", async () => {
    render(
      <Admin
        contract={mockContract as any}
        phase={0}
        backendMerkleRoot="0x01"
        contractMerkleRoot="0x02"
        onError={() => {}}
        onPhaseChange={() => {}}
      />
    );

    const syncButton = await screen.findByRole('button', { name: /Sync Now/i });
    await waitFor(() => expect(syncButton).not.toBeDisabled());
    fireEvent.click(syncButton);

    await waitFor(() => expect((globalThis as any).fetch).toHaveBeenCalled());
    await waitFor(() => expect(mockSetMerkleRoot).toHaveBeenCalledWith(`0x${"a".repeat(64)}`));
  });
});
