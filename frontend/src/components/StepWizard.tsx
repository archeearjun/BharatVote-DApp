import React from 'react';
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

const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep, lockedReason }) => {
  const clampedStep = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
      <div className="overflow-x-auto">
        <ol
          className="grid min-w-[640px] gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))` }}
          aria-label="Election progress"
        >
          {steps.map((step, idx) => {
            const status = idx < clampedStep ? 'complete' : idx === clampedStep ? 'current' : 'upcoming';
            const isLocked = Boolean(lockedReason) && idx > clampedStep;

            return (
              <li key={step.id} className="relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-[calc(50%+1.5rem)] right-[-1.25rem] top-5 h-px ${
                      idx < clampedStep ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}

                <div
                  className={`relative flex flex-col items-center rounded-2xl px-3 py-2 text-center transition-colors ${
                    status === 'current'
                      ? 'bg-slate-50'
                      : status === 'complete'
                        ? 'bg-green-50'
                        : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      status === 'complete'
                        ? 'border-green-600 bg-green-600 text-white'
                        : status === 'current'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                    aria-hidden="true"
                  >
                    {status === 'complete' ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      status === 'complete'
                        ? 'text-green-700'
                        : status === 'current'
                          ? 'text-slate-900'
                          : 'text-slate-700'
                    }`}
                  >
                    {step.title}
                  </p>

                  {step.description && (
                    <p className="mt-1 hidden text-sm leading-5 text-slate-500 md:block">
                      {step.description}
                    </p>
                  )}

                  {isLocked && (
                    <span className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Locked
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {lockedReason && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {lockedReason}
        </div>
      )}
    </div>
  );
};

export default StepWizard;
