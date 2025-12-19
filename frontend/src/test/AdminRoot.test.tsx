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
  setMerkleRoot: mockSetMerkleRoot,
};

describe("Admin merkle root helpers", () => {
  beforeEach(() => {
    mockSetMerkleRoot.mockClear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ merkleRoot: "0xabc" }),
    }) as any;
  });

  it("fetches merkle root and calls setMerkleRoot", async () => {
    render(
      <Admin
        contract={mockContract as any}
        phase={0}
        onError={() => {}}
        onPhaseChange={() => {}}
      />
    );

    const fetchButton = await screen.findByText(/Fetch Merkle Root/i);
    fireEvent.click(fetchButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const setButton = await screen.findByText(/Set Root On-Chain/i);
    fireEvent.click(setButton);

    await waitFor(() => expect(mockSetMerkleRoot).toHaveBeenCalledWith("0xabc"));
  });
});
