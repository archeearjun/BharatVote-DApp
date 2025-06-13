import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ethers } from "ethers";
import type { BharatVote as BharatVoteContract } from "@typechain/BharatVote.sol/BharatVote";
import { COMMIT_PHASE, REVEAL_PHASE, ERROR_MESSAGES, CONTRACT_ERRORS } from "./constants";

interface VoteFormProps {
  contract: BharatVoteContract | null;
  phase: number;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function VoteForm({
  contract,
  phase,
  onSuccess,
  onError,
}: VoteFormProps) {
  const [choice, setChoice] = useState<number | "">("");
  const [salt, setSalt] = useState<string>("");
  const [commitHash, setCommitHash] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const generateCommit = () => {
    try {
      if (typeof choice !== "number" || salt.trim() === "") {
        onError(ERROR_MESSAGES.INVALID_CANDIDATE);
        return;
      }

      const saltHash = ethers.keccak256(ethers.toUtf8Bytes(salt));
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "bytes32"],
        [choice, saltHash]
      );
      const hash = ethers.keccak256(encoded);
      setCommitHash(hash);

      // Optional: store salt for auto-reveal
      // const signer = await contract?.signer.getAddress();
      // localStorage.setItem(`bharatvote-salt-${signer}`, salt);

    } catch (e: any) {
      onError(e?.message || "Failed to generate commit");
    }
  };

  const withTxn = async (
    fn: () => Promise<ethers.ContractTransactionResponse>
  ) => {
    setBusy(true);
    try {
      if (!contract) {
        onError(CONTRACT_ERRORS.NO_CONTRACT);
        return;
      }
      const tx = await fn();
      await tx.wait();

      const message =
        phase === COMMIT_PHASE
          ? "Vote committed successfully!"
          : "Vote revealed successfully!";

      onSuccess(message);
    } catch (e: any) {
      onError(e?.message || ERROR_MESSAGES.CONNECT_FAILED);
    } finally {
      setBusy(false);
    }
  };

  const commitVote = () => {
    if (!commitHash) {
      onError("Please generate a commit hash first.");
      return;
    }
    withTxn(() => contract!.commitVote(commitHash, []));
  };

  const revealVote = () => {
    if (typeof choice !== "number" || salt.trim() === "") {
      onError(ERROR_MESSAGES.INVALID_CANDIDATE);
      return;
    }
    const saltHash = ethers.keccak256(ethers.toUtf8Bytes(salt));
    withTxn(() => contract!.revealVote(BigInt(choice), saltHash));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Candidate ID"
        type="number"
        value={choice}
        onChange={(e) => setChoice(Number(e.target.value))}
        disabled={busy}
        fullWidth
      />

      <TextField
        label="Salt (random string)"
        value={salt}
        onChange={(e) => setSalt(e.target.value)}
        disabled={busy}
        fullWidth
      />

      <Button
        variant="outlined"
        onClick={generateCommit}
        disabled={busy || choice === "" || salt.trim() === ""}
      >
        Generate Commit Hash
      </Button>

      {commitHash && (
        <Typography
          component="code"
          sx={{
            display: "block",
            wordBreak: "break-all",
            backgroundColor: "#f5f5f5",
            p: 1,
            borderRadius: 1,
          }}
        >
          {commitHash}
        </Typography>
      )}

      {phase === COMMIT_PHASE && (
        <Button
          variant="contained"
          onClick={commitVote}
          disabled={busy || !commitHash}
          startIcon={busy ? <CircularProgress size={16} /> : null}
        >
          {busy ? "Committing…" : "Commit Vote"}
        </Button>
      )}

      {phase === REVEAL_PHASE && (
        <Button
          variant="contained"
          onClick={revealVote}
          disabled={busy || choice === "" || salt.trim() === ""}
          startIcon={busy ? <CircularProgress size={16} /> : null}
        >
          {busy ? "Revealing…" : "Reveal Vote"}
        </Button>
      )}
    </Box>
  );
}
