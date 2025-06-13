import { useState, useEffect, useCallback } from "react";
import { ethers, zeroPadValue } from "ethers";
import type { BharatVote, PhaseChangedEvent } from "@typechain/BharatVote.sol/BharatVote";
import { TypedEventLog } from "@typechain/common";
import { ERROR_MESSAGES, CANDIDATE_MESSAGES } from "./constants";
import {
  COMMIT_PHASE,
  REVEAL_PHASE,
  FINISH_PHASE,
} from "./constants";
import "./Voter.css";

interface VoterProps {
  contract: BharatVote | null;
  phase: number;
  voterId: string;
  setPhase: (phase: number) => void;
  onRevealSuccess?: () => void;
}

/**
 * Utility — ensure a hex string is 0x‑prefixed and padded / split into bytes32 chunks
 */
const toBytes32Array = (hex: string): string[] => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length === 64) return [`0x${clean}`];
  if (clean.length % 64 !== 0) throw new Error(`Invalid proof node length: ${hex}`);
  return clean.match(/.{64}/g)!.map((chunk) => `0x${chunk}`);
};

const Voter: React.FC<VoterProps> = ({ contract, phase, voterId, setPhase, onRevealSuccess }) => {
  const [salt, setSalt] = useState<string>("");
  const [commit, setCommit] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                              Contract events                               */
  /* -------------------------------------------------------------------------- */

  const fetchCandidates = useCallback(async () => {
    if (!contract) return;
    const fetchedCandidates = await contract.getCandidates();
    setCandidates(fetchedCandidates);
  }, [contract]);

  useEffect(() => {
    if (!contract) return;

    const handlePhaseChanged = (
      newPhaseBigInt: bigint,
      _event: TypedEventLog<PhaseChangedEvent.Event>,
    ) => {
      setPhase(Number(newPhaseBigInt));
      fetchCandidates();
    };

    const refreshOnCandidateChange = () => fetchCandidates();

    contract.on(contract.filters.PhaseChanged(), handlePhaseChanged);
    contract.on(contract.filters.CandidateAdded(), refreshOnCandidateChange);
    contract.on(contract.filters.CandidateRemoved(), refreshOnCandidateChange);

    fetchCandidates();

    return () => {
      contract.off(contract.filters.PhaseChanged(), handlePhaseChanged);
      contract.off(contract.filters.CandidateAdded(), refreshOnCandidateChange);
      contract.off(contract.filters.CandidateRemoved(), refreshOnCandidateChange);
    };
  }, [contract, setPhase, fetchCandidates]);

  /* -------------------------------------------------------------------------- */
  /*                                Data fetch                                 */
  /* -------------------------------------------------------------------------- */

  const fetchMerkleProof = useCallback(async () => {
    if (!voterId) throw new Error("Voter ID is missing for Merkle proof.");
    const res = await fetch(`http://localhost:3001/api/merkle-proof?voter_id=${voterId}`);
    if (!res.ok) throw new Error(`Failed to fetch Merkle proof: ${await res.text()}`);
    return (await res.json()) as string[]; // expecting a plain array of hex strings
  }, [voterId]);

  /* -------------------------------------------------------------------------- */
  /*                               Commit helpers                               */
  /* -------------------------------------------------------------------------- */

  /** Pad / validate salt */
  const normaliseSalt = (raw: string) => {
    const prefixed = raw.startsWith("0x") ? raw : `0x${raw}`;
    return zeroPadValue(prefixed, 32); // ensures bytes32
  };

  const generateCommit = () => {
    try {
      if (selectedCandidateId === null) throw new Error("Please select a candidate.");
      if (!salt) throw new Error("Please provide a salt");

      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "bytes32"],
        [selectedCandidateId, normaliseSalt(salt)],
      );
      setCommit(ethers.keccak256(encoded));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.INVALID_COMMIT);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Handlers                                   */
  /* -------------------------------------------------------------------------- */

  const handleCommitVote = async () => {
    if (!contract) return alert("Ethereum contract not loaded.");
    if (selectedCandidateId === null) return alert("Please select a candidate.");
    if (!commit) return alert("Generate a commit first.");

    try {
      // Build commit hash again to be 100% sure it matches UI display
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode([
          "uint256",
          "bytes32",
        ], [selectedCandidateId, normaliseSalt(salt)]),
      );

      // ────────────────────   STEP 1: normalise proof to bytes32[]   ──────────────────── //
      const rawProof = await fetchMerkleProof();
      const proof: string[] = rawProof
        .flatMap(toBytes32Array)
        .map((n) => zeroPadValue(n, 32));

      console.table(
        proof.map((p) => ({ value: p, len: p.length, bytes: (p.length - 2) / 2 })),
      );

      const tx = await contract.commitVote(commitHash, proof);
      await tx.wait();
      alert("Vote committed successfully!");
      setSelectedCandidateId(null);
    } catch (error: any) {
      console.error("Error committing vote:", error);
      alert(`Error committing vote: ${error.message}`);
    }
  };

  const handleRevealVote = async () => {
    if (!contract) return alert("Ethereum contract not loaded.");
    if (selectedCandidateId === null) return alert("Please select a candidate.");
    if (!salt) return alert("Salt is required to reveal your vote.");

    try {
      const tx = await contract.revealVote(selectedCandidateId, normaliseSalt(salt));
      await tx.wait();
      alert("Vote revealed successfully!");
      setSelectedCandidateId(null);
      onRevealSuccess?.();
    } catch (error: any) {
      console.error("Error revealing vote:", error);
      alert(`Error revealing vote: ${error.message}`);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 UI helpers                                 */
  /* -------------------------------------------------------------------------- */

  const getPhaseLabel = (current: number) => {
    switch (current) {
      case COMMIT_PHASE:
        return "Commit Phase";
      case REVEAL_PHASE:
        return "Reveal Phase";
      case FINISH_PHASE:
        return "Election Finished";
      default:
        return "Unknown Phase";
    }
  };

  if (phase === FINISH_PHASE) {
    return (
      <div className="voter-container">
        <h2>Voting Period Ended</h2>
        <p>The voting period has ended. Please check the results.</p>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="voter-container">
      <h2>{getPhaseLabel(phase)}</h2>

      {error && <div className="error-message">{error}</div>}

      <h3>Available Candidates:</h3>
      {candidates.length > 0 ? (
        <ul>
          {candidates
            .filter((c) => c.isActive)
            .map((c) => (
              <li key={c.id.toString()}>
                ID: {c.id.toString()} – {c.name}
              </li>
            ))}
        </ul>
      ) : (
        <p>{CANDIDATE_MESSAGES.UI.NO_CANDIDATES}</p>
      )}

      {/* Candidate selector */}
      <div className="form-group">
        <label htmlFor="candidate">Candidate ID</label>
        <input
          id="candidate"
          type="number"
          min="0"
          value={selectedCandidateId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedCandidateId(v === "" ? null : Number(v));
          }}
          placeholder="Enter candidate ID"
        />
      </div>

      {/* Salt input */}
      <div className="form-group">
        <label htmlFor="salt">Salt</label>
        <input
          id="salt"
          type="text"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          placeholder="0x… or plain hex"
        />
      </div>

      {phase === COMMIT_PHASE && (
        <>
          <button
            className="action-button"
            onClick={generateCommit}
            disabled={selectedCandidateId === null || !salt}
          >
            Generate Commit
          </button>

          {commit && (
            <div className="commit-hash">
              <label>Commit Hash:</label>
              <code>{commit}</code>
            </div>
          )}

          <button
            className="action-button primary"
            onClick={handleCommitVote}
            disabled={!commit}
          >
            Commit Vote
          </button>
        </>
      )}

      {phase === REVEAL_PHASE && (
        <button
          className="action-button primary"
          onClick={handleRevealVote}
          disabled={selectedCandidateId === null || !salt}
        >
          Reveal Vote
        </button>
      )}
    </div>
  );
};

export default Voter;
