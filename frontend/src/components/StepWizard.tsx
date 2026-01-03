import React from 'react';
import { Box, Step, StepLabel, Stepper } from '@mui/material';
import type { StepIconProps } from '@mui/material/StepIcon';
import { Check } from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description?: string;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  lockedReason?: string;
}

const StepIcon = ({ active, completed, icon }: StepIconProps) => {
  const base = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold';
  if (completed) {
    return (
      <div className={`${base} bg-green-600 text-white`}>
        <Check className="w-4 h-4" />
      </div>
    );
  }
  if (active) {
    return <div className={`${base} bg-slate-900 text-white`}>{icon}</div>;
  }
  return <div className={`${base} bg-slate-200 text-slate-700`}>{icon}</div>;
};

const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep, lockedReason }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3">
      <Box sx={{ width: '100%' }}>
        <Stepper
          activeStep={Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0))}
          alternativeLabel
          sx={{
            '& .MuiStepConnector-line': { borderColor: 'rgb(203 213 225)' },
            '& .MuiStepLabel-label': { fontSize: '0.75rem', marginTop: '6px', color: 'rgb(51 65 85)' },
            '& .MuiStepLabel-label.Mui-active': { color: 'rgb(15 23 42)', fontWeight: 600 },
            '& .MuiStepLabel-label.Mui-completed': { color: 'rgb(21 128 61)', fontWeight: 600 },
          }}
        >
          {steps.map((step, idx) => {
            const isLocked = Boolean(lockedReason) && idx > currentStep;
            return (
              <Step key={step.id} completed={idx < currentStep} disabled={isLocked}>
                <StepLabel StepIconComponent={StepIcon}>
                  <span className="block leading-tight">{step.title}</span>
                  {step.description && (
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      {step.description}
                    </span>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
      {lockedReason && (
        <div className="mt-2 text-xs text-amber-700">
          {lockedReason}
        </div>
      )}
    </div>
  );
};

export default StepWizard;
