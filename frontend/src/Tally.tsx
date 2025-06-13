import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  Stack,
} from "@mui/material";
import { COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE, UI_MESSAGES, WALLET_ERRORS, CONTRACT_ERRORS } from "./constants";
import { BigNumberish } from "ethers";
import type { BharatVote as BharatVoteContract } from "@typechain/BharatVote.sol/BharatVote";

interface VoteCount {
  candidateId: number;
  candidateName: string;
  votes: number;
  percentage: number;
}

interface TallyProps {
  contract: BharatVoteContract | null;
  phase: number;
  refreshTrigger: number;
}

export default function Tally({ contract, phase, refreshTrigger }: TallyProps) {
  const [tally, setTally] = useState<VoteCount[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTally = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      const [rawResults, rawCandidates] = await Promise.all([
        contract.getTally(),
        contract.getCandidates(),
      ]);

      const total = rawResults.reduce((sum: number, v: BigNumberish) => sum + Number(v), 0);

      const counts: VoteCount[] = rawResults.map((v: BigNumberish, i: number) => ({
        candidateId: i,
        candidateName: rawCandidates[i].name,
        votes: Number(v),
        percentage: total > 0 ? (Number(v) / total) * 100 : 0,
      }));

      setTotalVotes(total);
      setTally(counts.sort((a, b) => b.votes - a.votes));
    } catch (e: any) {
      console.error("Tally fetch error:", e);
      setError(WALLET_ERRORS.CONNECT_FAILED ?? "Failed to fetch tally");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract || (phase !== FINISH_PHASE && phase !== REVEAL_PHASE)) {
      setLoading(false);
      return;
    }
    fetchTally();
  }, [contract, phase, fetchTally, refreshTrigger]);

  const getPhaseLabel = (currentPhase: number) => {
    switch (currentPhase) {
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

  // ──── Render ────

  if (!contract) {
    return (
      <Alert severity="warning">
        <AlertTitle>Connection Error</AlertTitle>
        {CONTRACT_ERRORS.NO_CONTRACT}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            {UI_MESSAGES.LOADING}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        onClose={() => setError(null)}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Election Results
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Total Votes: {totalVotes}
          </Typography>
        </Box>

        <Divider />

        {tally.length === 0 ? (
          <Alert severity="info">
            <AlertTitle>No Votes</AlertTitle>
            {UI_MESSAGES.NO_VOTES}
          </Alert>
        ) : (
          <List>
            {tally.map(({ candidateId, candidateName, votes, percentage }) => (
              <ListItem
                key={candidateId}
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  py: 2,
                }}
              >
                <ListItemText
                  primary={candidateName}
                  secondary={`${votes} vote${votes !== 1 ? "s" : ""} (${percentage.toFixed(
                    1
                  )}%)`}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </Paper>
  );
}
