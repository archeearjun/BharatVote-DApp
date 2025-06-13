import {
  CssBaseline,       // Provides a clean slate for CSS, normalizing styles across browsers.
  Container,         // Centers content horizontally and limits its width.
  ThemeProvider,     // Provides the Material-UI theme to all components.
  Box,               // A versatile layout component, useful for spacing and alignment.
  Button,            // Standard Material-UI button component.
  Typography,        // For consistent text styling (e.g., headings, paragraphs).
  Stack,             // Manages the layout of immediate children along the vertical or horizontal axis.
  AppBar,            // Represents a header bar, typically at the top of the application.
  Toolbar,           // A flexible container for displaying a variety of content horizontally.
  IconButton,        // A button that displays an icon.
  createTheme,       // Function to create a custom Material-UI theme.
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout"; // Icon for logging out or disconnecting.
import { useState, useEffect } from "react"; // React hooks for state and side effects.
import Admin from './Admin';   // Admin panel component.
import Voter from './Voter';   // Voter interface component.
import Tally from './Tally';   // Election tally display component.
import { 
  COMMIT_PHASE,      // Constant for the commit phase of the election.
  REVEAL_PHASE,      // Constant for the reveal phase of the election.
  FINISH_PHASE,      // Constant for the finished phase of the election.
} from "./constants"; // Application-wide constants.
import './App.css'; // Main application CSS.
import useWallet from "./useWallet"; // Custom hook for wallet connection and contract interaction.

/**
 * Defines the custom Material-UI theme for the application.
 * Configures primary and secondary color palettes.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A shade of blue for primary elements.
    },
    secondary: {
      main: '#dc004e', // A shade of red for secondary elements.
    },
  },
});

/**
 * Main application component.
 * Manages global state such as wallet connection, admin status, and election phase.
 * Conditionally renders Admin, Voter, or Tally components based on the current state.
 */
export default function App() {
  // Destructure state and functions from the custom useWallet hook.
  const { connect, disconnect, isConnected, isLoading, account, contract, error, chainId, provider } = useWallet();
  // State to determine if the connected account is the administrator.
  const [isAdmin, setIsAdmin] = useState(false);
  // State to hold the current phase of the election, initialized to COMMIT_PHASE.
  const [phase, setPhase] = useState<number>(COMMIT_PHASE);
  // State to force a refresh of the tally component
  const [tallyRefreshKey, setTallyRefreshKey] = useState<number>(0);

  // Debug logs for current wallet and contract states.
  // These provide insights into the application's connection status.
  console.log('DEBUG APP: isConnected', isConnected);
  console.log('DEBUG APP: isLoading', isLoading);
  console.log('DEBUG APP: account', account);
  console.log('DEBUG APP: contract', contract);
  console.log('DEBUG APP: error', error);
  console.log('DEBUG APP: chainId', chainId);

  /**
   * Returns a human-readable label for the given election phase.
   * @param currentPhase The numeric phase of the election.
   * @returns A string representing the phase label.
   */
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

  /**
   * Initiates the wallet connection process.
   * This function simply calls the `connect` function from the `useWallet` hook.
   */
  const connectWallet = async () => {
    connect();
  };

  /**
   * Effect hook to initialize application data and set up event listeners.
   * Runs when `isConnected`, `contract`, `account`, or `provider` change.
   */
  useEffect(() => {
    const init = async () => {
      try {
        // Proceed only if wallet is connected, contract and account are available.
        if (isConnected && contract && account && provider) {
          console.log('DEBUG: Attempting to fetch admin address...');
          // Test basic provider communication by getting block number.
          try {
            console.log('DEBUG: Attempting to get block number...');
            const blockNumber = await provider.getBlockNumber();
            console.log('DEBUG: Current Block Number:', blockNumber);
          } catch (blockErr) {
            console.error('DEBUG: Error getting block number:', blockErr);
            // Log error but continue execution to check admin fetch behavior.
          }

          // Fetch the admin address directly from the contract via provider.call.
          const callData = contract.interface.encodeFunctionData("admin");
          const adminResult = await provider.call({ to: contract.target as string, data: callData });
          const [adminAddress] = contract.interface.decodeFunctionResult("admin", adminResult);

          const currentAccount = account; // Use a local variable for consistency.
          // Determine if the connected account is the admin.
          const isCurrentAccountAdmin = (adminAddress as string).toLowerCase() === currentAccount.toLowerCase();
          setIsAdmin(isCurrentAccountAdmin);

          console.log('DEBUG: Connected Account:', currentAccount);
          console.log('DEBUG: Contract Admin Address:', adminAddress);
          console.log('DEBUG: Is Admin:', isCurrentAccountAdmin);

          // Fetch the current election phase from the contract.
          const currentPhase = await contract.phase();
          console.log('DEBUG APP EFFECT: Phase fetched from contract:', currentPhase);
          setPhase(Number(currentPhase)); // Update the phase state.

          // Listen for 'PhaseChanged' events from the contract.
          if (contract.on) {
            contract.on(contract.filters.PhaseChanged(), async (newPhase: bigint) => {
              console.log('DEBUG APP EVENT: PhaseChanged event - newPhase:', newPhase);
              setPhase(Number(newPhase)); // Update phase when a change event is received.

              const contractMerkleRoot = await contract.merkleRoot();
              console.log("DEBUG: Contract Merkle Root:", contractMerkleRoot);
            });
          }
        }

      } catch (err) {
        console.error('App initialization error:', err);
        // Errors are now managed by the useWallet hook, so no direct state update here.
      } finally {
        // Loading state is now managed by the useWallet hook, so no direct state update here.
      }
    };

    init(); // Call the initialization function when the effect runs.

    // Cleanup function for the effect.
    return () => {
      // Remove 'PhaseChanged' event listener when the component unmounts or dependencies change.
      if (contract && contract.removeAllListeners) {
        contract.removeAllListeners(contract.getEvent('PhaseChanged'));
      }
      // Wallet event listeners are managed by the useWallet hook.
    };
  }, [isConnected, contract, account, provider]); // Dependencies: re-run effect if these values change.

  // Display a loading spinner and message if the application is still loading.
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // Display an error message if there's an error during wallet connection or app initialization.
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button> {/* Button to reload the page and retry. */}
      </div>
    );
  }

  // Prompt the user to connect their wallet if not already connected.
  if (!account || !contract) {
    return (
      <div className="connect-container">
        <h2>Connect Wallet</h2>
        <p>Please connect your wallet to continue</p>
        <Button
          onClick={connectWallet} // Handler to initiate wallet connection.
          disabled={isLoading}    // Disable button while connecting.
          variant="contained"     // Material-UI contained button style.
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      </div>
    );
  }

  // Debug log for the current phase value, visible in the console.
  console.log('DEBUG APP HEADER: Current phase value:', phase);

  // Main application render.
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            {/* Display application title and current election phase. */}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              BharatVote {phase != null && `(${getPhaseLabel(phase)})`}
            </Typography>
            {/* Display connected account address. */}
            <Typography variant="subtitle2" sx={{ mr: 2 }}>
              {account}
            </Typography>
            {/* Disconnect wallet button. */}
            <IconButton
              color="inherit"
              onClick={() => {
                disconnect(); // Call disconnect function from useWallet hook.
              }}
              title="Disconnect wallet"
            >
              <LogoutIcon /> {/* Logout icon. */}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Stack spacing={4}>
            {/* Conditionally render Admin or Voter/Tally components based on isAdmin status. */}
            {isAdmin ? (
              <Admin contract={contract} phase={phase} />
            ) : (
              <>
                <Voter contract={contract} phase={phase} setPhase={setPhase} voterId={account} onRevealSuccess={() => setTallyRefreshKey(prev => prev + 1)} />
                <Tally contract={contract} phase={phase} refreshTrigger={tallyRefreshKey} />
              </>
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}