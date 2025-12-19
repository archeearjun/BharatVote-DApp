import React, { createContext, useContext, useMemo } from 'react';

type LanguageCode = 'en';

type Dictionary = Record<string, string>;

// Replicated strings from the original BharatVote frontend (English only)
const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    // App/Header
    'app.title': 'BharatVote',
    'app.subtitle': 'Digital Voting Platform',
    'header.connectedToMetaMask': 'Connected to MetaMask',
    'header.selectLanguage': 'Select Language',
    'header.connected': 'Connected to MetaMask',
    'header.language.english': 'English',
    'header.language.hindi': 'Hindi',
    'header.language.tamil': 'Tamil',

    // Phases
    'phase.commit': 'Commit Phase',
    'phase.reveal': 'Reveal Phase',
    'phase.finished': 'Finished Phase',
    'phase.commitDescription': 'Voters commit their votes with hashed values',
    'phase.revealDescription': 'Voters reveal their actual votes',
    'phase.finishedDescription': 'Election results are finalized',

    // Admin
    'admin.title': 'Election Progress',
    'admin.adminMode': 'Admin Mode',
    'admin.addCandidate': 'Add Candidate',
    'admin.input.placeholder': 'Enter candidate name',
    'admin.phaseControl': 'Phase Control',
    'admin.advanceReveal': 'Advance to Reveal Phase',
    'admin.advanceFinish': 'Advance to Finished Phase',
    'admin.advancePhase': 'Advance Phase',
    'admin.changingPhase': 'Changing Phase...',
    'admin.phaseAdvanceDescription': 'This will advance the election to the next phase',
    'admin.reset': 'Reset Election',
    'admin.clear': 'Clear All Candidates',
    'admin.registered': 'Registered Candidates',
    'admin.commitPhase': 'Commit Phase',
    'admin.candidateAdded': 'Candidate "{name}" added successfully!',
    'admin.phaseChanged': 'Phase changed to {phase}!',
    'admin.electionReset': 'Election has been reset to Commit phase',
    'admin.candidatesCleared': 'All candidates cleared',
    'admin.candidateRemoved': 'Candidate removed',
    'admin.addCandidateFailed': 'Failed to add candidate',
    'admin.phaseChangeFailed': 'Failed to change phase',
    'admin.resetFailed': 'Failed to reset election',
    'admin.clearFailed': 'Failed to clear candidates',
    'admin.removeFailed': 'Failed to remove candidate',
    'admin.id': 'ID',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.commitOnlyAdd': 'Can only add candidates in Commit Phase',
    'admin.addCandidateHelper': 'Candidate registration is allowed only during the Commit phase.',
    'admin.adding': 'Adding...',
    'admin.noCandidates': 'No candidates registered yet',
    'admin.addFirstCandidatePrompt': 'Use the form above to add your first candidate',
    'admin.addFirstCandidate': 'Add First Candidate',
    'admin.removeCandidate': 'Remove candidate',
    'admin.translateCandidateName': 'Translate Candidate Name',

    // Common
    'common.add': 'Add',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.translate': 'Translate',
    'common.save': 'Save',
    'common.remove': 'Remove',
    'common.active': 'Active',
    'common.inactive': 'Inactive',

    // Dialogs
    'dialog.advancePhaseTitle': 'Advance to {phaseLabel}?',
    'dialog.advancePhaseContent': 'This action cannot be reversed. Ensure candidate registration and voter onboarding are complete before proceeding.',
    'dialog.resetElectionTitle': 'Reset election?',
    'dialog.resetElectionContent': 'This will reset phases and voter states, and set all candidates active with zero tallies.',
    'dialog.clearCandidatesTitle': 'Clear all candidates?',
    'dialog.clearCandidatesContent': 'This removes all candidates. You can add them again in a new election.',
    'dialog.translateCandidateTitle': 'Translate Candidate Name',
    'dialog.translateCandidateDescription': 'Enter translations for "{candidateName}" in different languages.',

    // Voter
    'voter.commit': 'Commit',
    'voter.reveal': 'Reveal',
    'voter.finished': 'Finished',
    'voter.submitEncryptedVote': 'Submit your encrypted vote',
    'voter.revealActualVote': 'Reveal your actual vote',
    'voter.electionCompleted': 'Election completed',
    'voter.commitVote': 'Commit Vote',
    'voter.committing': 'Committing...',
    'voter.revealVote': 'Reveal Vote',
    'voter.revealing': 'Revealing...',
    'voter.eligible': 'Eligible',
    'voter.notEligible': 'Not Eligible',
    'voter.phase': 'Phase',
    'voter.revealYourVote': 'Reveal Your Vote',
    'voter.selectCandidateVotedFor': 'Select the Candidate You Voted For',
    'voter.yourSalt': 'Your Salt',
    'voter.enterExactSalt': 'Enter the exact salt you used when committing your vote',
    'voter.selectSameCandidate': 'Select the same candidate you chose during the commit phase.',
    'voter.enterSameSalt': 'Enter the same salt you used during the commit phase to reveal your vote.',
    'voter.readyToReveal': 'Ready to reveal your vote?',
    'voter.electionComplete': 'Election Complete',
    'voter.electionFinished': 'The election has finished. You can view the results in the tally section below.',
    'voter.candidates': 'Candidates',
    'voter.noCandidatesAvailable': 'No candidates available yet.',
    'voter.candidatesNeedAdmin': 'Candidates need to be added by an administrator.',
    'voter.checkVoteStatus': 'Check Vote Status',

    // Tally
    'tally.commit': 'Commit',
    'tally.reveal': 'Reveal',
    'tally.finished': 'Finished',
    'tally.votesBeingCollected': 'Votes being collected',
    'tally.votesBeingCounted': 'Votes being counted',
    'tally.resultsFinalized': 'Results finalized',
    'tally.liveResults': 'Live Results',
    'tally.finalResults': 'Final Results',
    'tally.electionResults': 'Election Results',
    'tally.totalVotes': 'Total Votes',
    'tally.winner': 'Winner',
    'tally.noWinner': 'No winner yet',
    'tally.lastUpdated': 'Last Updated',
    'tally.refreshResults': 'Refresh Results',
    'tally.failedToFetch': 'Failed to fetch election results',
    'tally.commitPhase': 'Commit Phase',
    'tally.revealPhase': 'Reveal Phase',
    'tally.electionComplete': 'Election Complete',
    'tally.votesBeingRevealed': 'Votes are being revealed and counted. Results will update in real-time as votes are revealed.',
    'tally.allVotesCounted': 'All votes have been counted. Final results are displayed below.',
    'tally.electionProgress': 'Election Progress',
    'tally.candidates': 'Candidates',
    'tally.final': 'Final',
    'tally.live': 'Live',
    'tally.status': 'Status',
    'tally.electionWinner': '🏆 Election Winner',
    'tally.withVotes': 'with',
    'tally.liveVoteCounts': 'Live Vote Counts',
    'tally.finalVoteCounts': 'Final Vote Counts',
    'tally.electionNotStarted': 'Election Not Started',
    'tally.noResultsAvailable': 'No Results Available',
    'tally.addCandidates': 'Candidates need to be added by an administrator before voting can begin.',
    'tally.votesRevealed': 'Votes are being revealed. Results will appear here once votes are counted.',
    'tally.votingInProgress': 'Voting in Progress',
    'tally.commitPhaseActive': 'The commit phase is active. Vote counts will be visible once the reveal phase begins.',

    // KYC/OTP (subset used across flows)
    'kyc.voterIdKYC': 'Voter ID KYC',
    'kyc.addressUpdate': 'Address Update',
    'kyc.epicNumber': 'EPIC Number',
    'kyc.epicPlaceholder': 'e.g. ABC123456789',
    'kyc.sendOTP': 'Send OTP',
    'kyc.currentAddress': 'Current Address',
    'kyc.addressPlaceholder': 'House no, Street, City',
    'otp.enterOTP': 'Enter OTP',
    'otp.verifyOTP': 'Verify OTP',
    'otp.resendOTP': 'Resend OTP',
    'otp.otpSent': 'OTP sent successfully',
    'otp.otpVerified': 'OTP verified successfully',
    'otp.otpFailed': 'OTP verification failed',
    'kyc.epic': 'EPIC',
    'kyc.otp': 'OTP',
    'kyc.complete': 'Complete',
    'kyc.voterVerification': 'Voter Verification',
    'kyc.enterVoterId': 'Enter your Voter ID (EPIC Number)',
    'kyc.voterIdPlaceholder': 'e.g. ABC123456789',
    'kyc.verifying': 'Verifying...',
    'kyc.voterIdVerified': 'Voter ID verified! OTP sent to registered mobile number',
    'kyc.kycValidationFailed': 'KYC validation failed. Please check your Voter ID and try again.',
    'kyc.enterCompleteOTP': 'Please enter complete 6-digit OTP',
    'kyc.otpVerified': 'OTP verified! Please look at the camera',
    'kyc.otpVerificationFailed': 'OTP verification failed. Please try again.',
    'kyc.faceVerification': 'Face Verification',
    'kyc.lookAtCamera': 'Please look at the camera for face verification',
    'kyc.verifyingFace': 'Verifying face...',
    'kyc.faceVerified': 'Face verification successful!',
    'kyc.faceVerificationFailed': 'Face verification failed. Please try again.',
  },
};

type I18nContextValue = {
  lang: LanguageCode;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lang: LanguageCode = 'en';

  const t = useMemo(() => {
    return (key: string) => {
      const dict = dictionaries[lang] || dictionaries.en;
      return dict[key] || key;
    };
  }, [lang]);

  const value: I18nContextValue = { lang, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
