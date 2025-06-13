import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import { PHASE_LABELS, ERROR_MESSAGES, COMMIT_PHASE, REVEAL_PHASE, FINISH_PHASE, CANDIDATE_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import type { BharatVote } from "@typechain/BharatVote.sol/BharatVote";
import type { Candidate } from "./types/candidates";

interface AdminProps {
  contract: BharatVote | null;
  phase: number;
  onError?: (error: string) => void;
}

interface AdminState {
  candidateName: string;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AdminState = {
  candidateName: "",
  candidates: [],
  loading: false,
  error: null,
  success: null,
};

export default function Admin({ contract, phase, onError }: AdminProps) {
  const [state, setState] = useState<AdminState>(initialState);

  const fetchCandidates = useCallback(async () => {
    if (!contract) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const fetchedCandidates = await contract.getCandidates();
      setState(prev => ({
        ...prev,
        candidates: fetchedCandidates.map((c: { id: BigInt; name: string; isActive: boolean }) => ({
          id: Number(c.id),
          name: c.name,
          isActive: c.isActive
        })),
        loading: false
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : CANDIDATE_MESSAGES.ERRORS.FETCH_FAILED;
      setState(prev => ({ ...prev, error: message, loading: false }));
      onError?.(message);
    }
  }, [contract, onError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAddCandidate = async () => {
    if (!contract || !state.candidateName.trim() || phase !== COMMIT_PHASE) {
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.WRONG_PHASE
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const tx = await contract.addCandidate(state.candidateName.trim());
      await tx.wait();
      setState(prev => ({
        ...prev,
        candidateName: "",
        success: SUCCESS_MESSAGES.CANDIDATE_ADDED,
      }));
      await fetchCandidates();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.TRANSACTION_FAILED;
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const getNextPhaseButtonLabel = useCallback((currentPhase: number): string => {
    switch (currentPhase) {
      case COMMIT_PHASE:
        return `Advance to ${PHASE_LABELS[REVEAL_PHASE]}`;
      case REVEAL_PHASE:
        return `Advance to ${PHASE_LABELS[FINISH_PHASE]}`;
      case FINISH_PHASE:
        return `Election Finished`; // Button should be disabled, but provide a label
      default:
        return "Advance Phase";
    }
  }, []);

  const handlePhaseAdvance = async () => {
    if (!contract || phase === FINISH_PHASE) return;
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      let tx;
      switch (phase) {
        case COMMIT_PHASE:
          tx = await contract.startReveal();
          break;
        case REVEAL_PHASE:
          tx = await contract.finishElection();
          break;
        default:
          throw new Error(ERROR_MESSAGES.WRONG_PHASE);
      }
      if (tx) {
        await tx.wait();
        setState(prev => ({
          ...prev,
          success: `Advanced to ${getNextPhaseButtonLabel(phase).replace("Advance to ", "")}`,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.TRANSACTION_FAILED;
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleResetElection = async () => {
    if (!contract || phase !== FINISH_PHASE) return;
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const tx = await contract.resetElection();
      await tx.wait();
      setState(prev => ({
        ...prev,
        success: SUCCESS_MESSAGES.ELECTION_RESET,
      }));
      await fetchCandidates();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.TRANSACTION_FAILED;
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClearAllCandidates = async () => {
    if (!contract || phase !== FINISH_PHASE) return;
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const tx = await contract.clearAllCandidates();
      await tx.wait();
      setState(prev => ({
        ...prev,
        success: SUCCESS_MESSAGES.CANDIDATES_CLEARED,
      }));
      await fetchCandidates();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.TRANSACTION_FAILED;
      setState(prev => ({ ...prev, error: message }));
      onError?.(message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Admin Panel</Typography>
          <Chip
            label={PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
            color="primary"
            variant="outlined"
          />
        </Stack>

        {state.error && (
          <Alert severity="error" onClose={() => setState(p => ({ ...p, error: null }))}>
            {state.error}
          </Alert>
        )}
        {state.success && (
          <Alert severity="success" onClose={() => setState(p => ({ ...p, success: null }))}>
            {state.success}
          </Alert>
        )}

        <Box>
          <Typography variant="subtitle1" gutterBottom>Add Candidate</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              value={state.candidateName}
              onChange={e => setState(prev => ({ ...prev, candidateName: e.target.value }))}
              placeholder="Enter candidate name"
              size="small"
              disabled={state.loading || phase !== COMMIT_PHASE}
              fullWidth
              helperText={phase !== COMMIT_PHASE ? "Can only add candidates in Commit Phase" : ""}
            />
            <Button
              variant="contained"
              onClick={handleAddCandidate}
              disabled={state.loading || !state.candidateName.trim() || phase !== COMMIT_PHASE}
            >
              {state.loading ? <CircularProgress size={24} /> : "Add"}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>Phase Control</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handlePhaseAdvance}
              disabled={state.loading || phase === FINISH_PHASE}
              fullWidth
            >
              {state.loading && phase !== FINISH_PHASE ? <CircularProgress size={24} /> : getNextPhaseButtonLabel(phase)}
            </Button>
            <Button
              variant="outlined"
              onClick={handleResetElection}
              disabled={state.loading || phase !== FINISH_PHASE}
              fullWidth
            >
              {state.loading && phase === FINISH_PHASE ? <CircularProgress size={24} /> : "Reset Election"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearAllCandidates}
              disabled={state.loading || phase !== FINISH_PHASE}
              fullWidth
              color="error"
            >
              {state.loading && phase === FINISH_PHASE ? <CircularProgress size={24} /> : "Clear All Candidates"}
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>Registered Candidates</Typography>
          {state.loading ? (
            <CircularProgress size={24} />
          ) : state.candidates.length === 0 ? (
            <Alert severity="info">{CANDIDATE_MESSAGES.UI.NO_CANDIDATES_ADMIN}</Alert>
          ) : (
            <Stack spacing={1}>
              {state.candidates.map((candidate) => (
                <Box
                  key={candidate.id}
                  sx={{
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{candidate.name}</Typography>
                  <Chip
                    size="small"
                    label={`ID: ${candidate.id} - ${candidate.isActive ? "Active" : "Inactive"}`}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}