import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import Commit from "./VoteForm";
import Reveal from "./Reveal";
import { COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE, PHASE_LABELS, CONTRACT_ERRORS } from "./constants";
import type { BharatVote } from "@typechain/BharatVote.sol/BharatVote";

interface VotingPanelProps {
  contract: BharatVote | null;
}

export default function VotingPanel({ contract }: VotingPanelProps) {
  const [phase, setPhase] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) {
      setError(CONTRACT_ERRORS.NO_CONTRACT);
      setLoading(false);
      return;
    }

    const fetchPhase = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await contract.phase();
        const phaseIndex = Number(raw);
        if (phaseIndex >= 0 && phaseIndex <= 2) {
          setPhase(phaseIndex);
        } else {
          setPhase(null);
        }
      } catch (err) {
        console.error("Failed to fetch current phase:", err);
        setError(CONTRACT_ERRORS.PHASE_ERROR);
      } finally {
        setLoading(false);
      }
    };

    const handlePhaseChanged = (newPhase: bigint) => {
      const phaseIndex = Number(newPhase);
      if (phaseIndex >= 0 && phaseIndex <= 2) {
        setPhase(phaseIndex);
      } else {
        setPhase(null);
      }
    };

    fetchPhase();
    contract.on(contract.filters.PhaseChanged(), handlePhaseChanged);

    return () => {
      contract.off(contract.filters.PhaseChanged(), handlePhaseChanged);
    };
  }, [contract]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading election phase…
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (phase === null) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">{CONTRACT_ERRORS.PHASE_ERROR}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Election Phase: {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
      </Typography>

      {phase === COMMIT_PHASE && (
        <Commit contract={contract} phase={phase} onSuccess={() => {}} onError={() => {}} />
      )}
      {phase === REVEAL_PHASE && (
        <Reveal contract={contract} onSuccess={() => {}} onError={() => {}} />
      )}
      {phase === FINISH_PHASE && (
        <Alert severity="info">The election is finished.</Alert>
      )}
    </Paper>
  );
}
