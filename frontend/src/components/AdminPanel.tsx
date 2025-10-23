import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PlayArrow, 
  CheckCircle, 
  RadioButtonUnchecked,
  Add as AddIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { getCandidateLabel, setCandidateLabels } from '../utils/candidateLabels';

interface AdminPanelProps {
  contract: any;
  phase: number;
  candidates: any[];
  onCandidateAdded: () => void;
  onPhaseChange: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  contract,
  phase,
  candidates,
  onCandidateAdded,
  onPhaseChange,
}) => {
  const { t, lang } = useI18n() as any;
  const [newCandidateName, setNewCandidateName] = useState('');
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isChangingPhase, setIsChangingPhase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  // const [candidateToRemove, setCandidateToRemove] = useState<number | null>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translateFor, setTranslateFor] = useState<{ id: number; name: string } | null>(null);
  const [labels, setLabels] = useState<{ en: string; hi: string; ta: string }>({ en: '', hi: '', ta: '' });

  // Initialize translations for existing candidates if they don't have translations
  useEffect(() => {
    if (candidates.length > 0 && contract?.target) {
      const address = contract.target as string;
      console.log('Initializing translations for candidates:', candidates);
      console.log('Contract address:', address);
      
      candidates.forEach(candidate => {
        console.log('Processing candidate:', candidate);
        const existingEn = getCandidateLabel(address, candidate.id, 'en');
        const existingHi = getCandidateLabel(address, candidate.id, 'hi');
        const existingTa = getCandidateLabel(address, candidate.id, 'ta');
        
        console.log(`Existing translations for ${candidate.id}:`, { en: existingEn, hi: existingHi, ta: existingTa });
        
        // Initialize missing translations
        const updates: any = {};
        if (!existingEn) updates.en = candidate.name;
        if (!existingHi) updates.hi = candidate.name; // Use English as placeholder
        if (!existingTa) updates.ta = candidate.name; // Use English as placeholder
        
        if (Object.keys(updates).length > 0) {
          setCandidateLabels(address, candidate.id, updates);
          console.log(`Initialized translations for candidate ${candidate.id}:`, updates);
        }
      });
    }
  }, [candidates, contract?.target]);

  // Function to manually add translations for existing candidates
  const initializeCandidateTranslations = () => {
    if (candidates.length > 0 && contract?.target) {
      const address = contract.target as string;
      let updatedCount = 0;
      
      candidates.forEach(candidate => {
        // Always ensure English translation exists
        const existingEn = getCandidateLabel(address, candidate.id, 'en');
        const existingHi = getCandidateLabel(address, candidate.id, 'hi');
        const existingTa = getCandidateLabel(address, candidate.id, 'ta');
        
        const updates: any = {};
        if (!existingEn) {
          updates.en = candidate.name;
          updatedCount++;
        }
        if (!existingHi) {
          updates.hi = candidate.name; // Use English as fallback for now
          updatedCount++;
        }
        if (!existingTa) {
          updates.ta = candidate.name; // Use English as fallback for now
          updatedCount++;
        }
        
        if (Object.keys(updates).length > 0) {
          setCandidateLabels(address, candidate.id, updates);
          console.log(`Updated translations for candidate ${candidate.id}:`, updates);
        }
      });
      
      if (updatedCount > 0) {
        setSuccess(`Initialized ${updatedCount} candidate translations`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setSuccess('All candidates already have translations');
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const phases = [
    { id: 0, label: t('phase.commit'), description: t('phase.commitDescription'), color: 'primary' },
    { id: 1, label: t('phase.reveal'), description: t('phase.revealDescription'), color: 'warning' },
    { id: 2, label: t('phase.finished'), description: t('phase.finishedDescription'), color: 'success' }
  ];

  // const getCurrentPhase = () => phases.find(p => p.id === phase) || phases[0];
  const canAddCandidate = newCandidateName.trim().length > 0 && newCandidateName.trim().length <= 100;
  const canChangePhase = phase < 2;
  const canReset = phase === 2;
  const canClear = phase === 2;

  const handleAddCandidate = async () => {
    if (!canAddCandidate) return;
    
    setIsAddingCandidate(true);
    setError(null);
    
    try {
      // Capture index before add; new candidate ID equals previous count
      const countBefore = await contract.candidateCount?.();
      const tx = await contract.addCandidate(newCandidateName.trim());
      await tx.wait();
      const newId = Number(countBefore ?? 0);
      const address = (contract?.target as string) || (contract?.address as string) || '';
      
      // Save translations for ALL languages when adding a candidate
      const candidateName = newCandidateName.trim();
      setCandidateLabels(address, newId, { 
        en: candidateName,
        hi: candidateName, // For now, use English name as placeholder
        ta: candidateName  // For now, use English name as placeholder
      });
      
      console.log(`Added candidate ${newId} with translations:`, {
        en: candidateName,
        hi: candidateName,
        ta: candidateName
      });
      
      setNewCandidateName('');
      setSuccess(t('admin.candidateAdded', { name: candidateName }));
      onCandidateAdded();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || t('admin.addCandidateFailed'));
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const performPhaseChange = async () => {
    if (!canChangePhase) return;
    
    setIsChangingPhase(true);
    setError(null);
    
    try {
      const tx = phase === 0 ? await contract.startReveal() : await contract.finishElection();
      await tx.wait();
      setSuccess(t('admin.phaseChanged', { phase: phases[phase + 1]?.label }));
      onPhaseChange();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || t('admin.phaseChangeFailed'));
    } finally {
      setIsChangingPhase(false);
    }
  };

  const handlePhaseChange = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);
  const handleConfirmProceed = async () => {
    setConfirmOpen(false);
    await performPhaseChange();
  };

  const handleResetElection = async () => {
    setConfirmResetOpen(false);
    try {
      const tx = await contract.resetElection();
      await tx.wait();
      setSuccess(t('admin.electionReset'));
      onPhaseChange();
      onCandidateAdded();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || t('admin.resetFailed'));
    }
  };

  const handleClearCandidates = async () => {
    setConfirmClearOpen(false);
    try {
      const tx = await contract.clearAllCandidates();
      await tx.wait();
      setSuccess(t('admin.candidatesCleared'));
      onCandidateAdded();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || t('admin.clearFailed'));
    }
  };

  // const handleRemoveCandidate = async (id: number) => {
  //   try {
  //     const tx = await contract.removeCandidate(id);
  //     await tx.wait();
  //     setSuccess(t('admin.candidateRemoved'));
  //     onCandidateAdded();
  //     setTimeout(() => setSuccess(null), 3000);
  //   } catch (err: any) {
  //     setError(err.message || t('admin.removeFailed'));
  //   } finally {
  //     setCandidateToRemove(null);
  //   }
  // };

  const openTranslateDialog = (candidate: any) => {
    const address = contract?.target || contract?.address || '';
    const existingLabels = {
      en: getCandidateLabel(address, candidate.id, 'en') || candidate.name,
      hi: getCandidateLabel(address, candidate.id, 'hi') || candidate.name,
      ta: getCandidateLabel(address, candidate.id, 'ta') || candidate.name
    };
    
    setLabels(existingLabels);
    setTranslateFor({ id: candidate.id, name: candidate.name });
    setTranslateOpen(true);
  };

  const handleSaveTranslation = () => {
    if (translateFor && contract?.target) {
      const address = contract.target as string;
      setCandidateLabels(address, translateFor.id, labels);
      setSuccess(`Translations saved for candidate ${translateFor.name}`);
      setTimeout(() => setSuccess(null), 3000);
      setTranslateOpen(false);
      setTranslateFor(null);
      setLabels({ en: '', hi: '', ta: '' });
    }
  };

  const getPhaseIcon = (phaseId: number) => {
    if (phaseId < phase) return <CheckCircle color="success" />;
    if (phaseId === phase) return <RadioButtonUnchecked color="primary" />;
    return <RadioButtonUnchecked color="disabled" />;
  };

  return (
    <div className="space-y-6">
      {/* Admin Mode Badge */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
          <AdminIcon className="w-4 h-4 mr-2" />
          {t('admin.adminMode')}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Election Progress */}
      <Card className="shadow-sm border border-gray-100 dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-800 dark:text-white">
            {t('admin.title')}
          </Typography>
          
          <div className="mb-6">
            <Stepper activeStep={phase} orientation="horizontal" className="mb-4">
              {phases.map((phaseItem) => (
                <Step key={phaseItem.id} completed={phase > phaseItem.id}>
                  <StepLabel
                    StepIconComponent={() => getPhaseIcon(phaseItem.id)}
                    className={phase === phaseItem.id ? 'text-blue-600' : ''}
                  >
                    <div className="text-center">
                      <Typography 
                        variant="body2" 
                        className={`font-medium ${phase === phaseItem.id ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {phaseItem.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        className="text-gray-400 block mt-1 max-w-24"
                      >
                        {phaseItem.description}
                      </Typography>
                    </div>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          {canChangePhase && (
            <div className="text-center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handlePhaseChange}
                disabled={isChangingPhase}
                startIcon={isChangingPhase ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayArrow />}
                className="px-8 py-3 text-base font-medium"
              >
                {isChangingPhase ? t('admin.changingPhase') : (phase === 0 ? t('admin.advanceReveal') : t('admin.advanceFinish'))}
              </Button>
              <Typography variant="caption" className="block mt-2 text-gray-500">
                {t('admin.phaseAdvanceDescription')}
              </Typography>
            </div>
          )}

          {/* Reset / Clear controls */}
          <div className="mt-4 flex gap-3 justify-center">
            <Tooltip title={canReset ? t('admin.reset') : t('admin.reset')}>
              <span>
                <Button variant="outlined" disabled={!canReset} onClick={() => setConfirmResetOpen(true)}>{t('admin.reset')}</Button>
              </span>
            </Tooltip>
            <Tooltip title={canClear ? t('admin.clear') : t('admin.clear')}>
              <span>
                <Button variant="outlined" disabled={!canClear} onClick={() => setConfirmClearOpen(true)}>{t('admin.clear')}</Button>
              </span>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Phase change confirm dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose} fullWidth maxWidth="xs">
        <DialogTitle>{t('dialog.advancePhaseTitle', { phaseLabel: phases[phase + 1]?.label })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600">
            {t('dialog.advancePhaseContent')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmProceed} variant="contained" color="primary" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset election confirm */}
      <Dialog open={confirmResetOpen} onClose={() => setConfirmResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dialog.resetElectionTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600">
            {t('dialog.resetElectionContent')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmResetOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleResetElection} variant="contained" color="primary" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear candidates confirm */}
      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dialog.clearCandidatesTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600">
            {t('dialog.clearCandidatesContent')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleClearCandidates} variant="contained" color="primary" autoFocus>
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Candidate */}
      <Card className="shadow-sm border border-gray-100 dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-800 dark:text-white">
            {t('admin.addCandidate')}
          </Typography>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <TextField
                fullWidth
                label={t('admin.addCandidate')}
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
                placeholder={t('admin.input.placeholder')}
                variant="outlined"
                size="medium"
                error={newCandidateName.length > 100}
                helperText={phase !== 0 ? t('admin.addCandidateHelper') : `${newCandidateName.length}/100`}
                className="mb-2"
                disabled={phase !== 0}
              />
            </div>
            
            <Tooltip 
              title={!canAddCandidate ? t('admin.input.placeholder') : t('admin.addCandidate')}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddCandidate}
                  disabled={!canAddCandidate || isAddingCandidate || phase !== 0}
                  startIcon={isAddingCandidate ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AddIcon />}
                  size="large"
                  className="px-6 py-3 h-14"
                >
                  {isAddingCandidate ? t('admin.adding') : t('admin.add')}
                </Button>
              </span>
            </Tooltip>
          </div>
          {phase !== 0 && (
            <Typography variant="caption" className="block mt-2 text-gray-500">
              {t('admin.addCandidateHelper')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Registered Candidates */}
      <Card className="shadow-sm border border-gray-100 dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="text-gray-900 dark:text-white">
              {t('admin.registered')} ({candidates.length})
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={initializeCandidateTranslations}
              className="dark:bg-slate-600 dark:text-white dark:border-slate-500"
            >
              Initialize Translations
            </Button>
          </div>
          
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <InfoIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <Typography variant="body1" className="text-gray-600 dark:text-slate-300 mb-2">
                {t('admin.noCandidates')}
              </Typography>
              <Typography variant="body2" className="text-gray-500 dark:text-slate-400 mb-4">
                {t('admin.addFirstCandidatePrompt')}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => document.querySelector('input')?.focus()}
                startIcon={<AddIcon />}
              >
                {t('admin.addFirstCandidate')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => {
                  const address = contract?.target || contract?.address || '';
                  const translatedName = getCandidateLabel(address, candidate.id, (lang as any) || 'en') || candidate.name;
                  console.log(`Candidate ${candidate.id}: original="${candidate.name}", translated="${translatedName}", lang="${lang}"`);
                  
                  return (
                    <Card key={candidate.id} className="mb-3 dark:bg-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Typography variant="h6" className="text-gray-900 dark:text-white mb-2">
                              {translatedName}
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Chip 
                                label={`${t('admin.id')}: ${candidate.id}`} 
                                size="small" 
                                variant="outlined" 
                                className="dark:bg-slate-600 dark:text-white"
                              />
                              <Chip 
                                label={candidate.active ? t('common.active') : t('common.inactive')} 
                                color={candidate.active ? 'success' : 'default'} 
                                size="small" 
                                variant="outlined"
                                className="dark:bg-slate-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="small" variant="outlined" onClick={() => openTranslateDialog(candidate)}>{t('common.translate')}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translate candidate dialog */}
      <Dialog open={translateOpen} onClose={() => setTranslateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dialog.translateCandidateTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4 text-gray-600 dark:text-gray-300">
            {t('dialog.translateCandidateDescription', { candidateName: translateFor?.name })}
          </Typography>
          
          <Typography variant="body2" className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> For Hindi and Tamil, provide the actual translated names, not just the English names. 
            This will make the voting experience more accessible to users in their preferred language.
          </Typography>
          
          <div className="space-y-3">
            <TextField
              fullWidth
              label="English Name"
              value={labels.en}
              onChange={(e) => setLabels({ ...labels, en: e.target.value })}
              variant="outlined"
              size="small"
              className="dark:bg-slate-700"
            />
            <TextField
              fullWidth
              label="Hindi Name (हिंदी नाम)"
              value={labels.hi}
              onChange={(e) => setLabels({ ...labels, hi: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="Enter Hindi translation"
              className="dark:bg-slate-700"
            />
            <TextField
              fullWidth
              label="Tamil Name (தமிழ் பெயர்)"
              value={labels.ta}
              onChange={(e) => setLabels({ ...labels, ta: e.target.value })}
              variant="outlined"
              size="small"
              placeholder="Enter Tamil translation"
              className="dark:bg-slate-700"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTranslateOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveTranslation} variant="contained" color="primary">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPanel; 