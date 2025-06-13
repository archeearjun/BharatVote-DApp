import { useState } from "react";
import { ethers } from "ethers";
import {
  Paper,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { VOTING_MESSAGES, SUCCESS_MESSAGES, UI_MESSAGES, CONTRACT_ERRORS } from "./constants";
import type { BharatVote as BharatVoteContract } from "@typechain/BharatVote.sol/BharatVote";

interface RevealProps {
  contract: BharatVoteContract | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function Reveal({ contract, onSuccess, onError }: RevealProps) {
  const [choice, setChoice] = useState("");
  const [salt, setSalt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReveal = async () => {
    if (!contract) {
      const message = CONTRACT_ERRORS.NO_CONTRACT;
      setError(message);
      onError?.(message);
      return;
    }

    if (!choice || isNaN(Number(choice)) || Number(choice) < 0) {
      const message = VOTING_MESSAGES.ERRORS.INVALID_CANDIDATE;
      setError(message);
      onError?.(message);
      return;
    }

    if (!salt.trim()) {
      const message = VOTING_MESSAGES.ERRORS.VOTE_NOT_FOUND;
      setError(message);
      onError?.(message);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const saltHash = ethers.keccak256(ethers.toUtf8Bytes(salt));
      const tx = await contract.revealVote(BigInt(Number(choice)), saltHash);
      await tx.wait();

      const message = SUCCESS_MESSAGES.VOTE_REVEALED;
      setSuccess(message);
      onSuccess?.(message);
      setChoice("");
      setSalt("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : VOTING_MESSAGES.ERRORS.VOTE_REVEAL_FAILED;
      setError(message);
      onError?.(message);
      console.error("Reveal error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Reveal Your Vote</Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            <AlertTitle>Success</AlertTitle>
            {success}
          </Alert>
        )}

        <TextField
          label="Candidate ID"
          type="number"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          disabled={isLoading}
          error={!!choice && (isNaN(Number(choice)) || Number(choice) < 0)}
          helperText={
            !!choice &&
            (isNaN(Number(choice)) || Number(choice) < 0)
              ? VOTING_MESSAGES.ERRORS.INVALID_CANDIDATE
              : ""
          }
          fullWidth
        />

        <TextField
          label="Salt"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          disabled={isLoading}
          placeholder="Enter the same salt used while committing"
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleReveal}
          disabled={isLoading || !choice || !salt}
          fullWidth
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              {UI_MESSAGES.PROCESSING}
            </>
          ) : (
            "Reveal Vote"
          )}
        </Button>
      </Stack>
    </Paper>
  );
}
