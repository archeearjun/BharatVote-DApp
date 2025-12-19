import React from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  lockedReason?: string;
}

const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep, lockedReason }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const status = idx === currentStep ? 'active' : idx < currentStep ? 'done' : 'pending';
              const isLocked = lockedReason && idx > currentStep;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition ${
                    status === 'active'
                      ? 'border-blue-300 bg-blue-50'
                      : status === 'done'
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      Step {idx + 1}
                    </span>
                    {status === 'done' && <span className="text-green-600 text-xs font-semibold">Done</span>}
                    {status === 'active' && <span className="text-blue-600 text-xs font-semibold">Now</span>}
                    {status === 'pending' && <span className="text-slate-400 text-xs">Next</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                  {isLocked && (
                    <p className="text-[11px] text-amber-600 mt-2">
                      {lockedReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepWizard;