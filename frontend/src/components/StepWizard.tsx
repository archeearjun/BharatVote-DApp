import React from 'react';
import { Check } from 'lucide-react';

function clampStep(value: number, stepCount: number): number {
  return Math.min(Math.max(value, 0), Math.max(stepCount - 1, 0));
}

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
  const clampedStep = clampStep(currentStep, steps.length);
  const resolvedSteps = steps.map((step, idx) => {
    const status = idx < clampedStep ? 'complete' : idx === clampedStep ? 'current' : 'upcoming';
    const isLocked = Boolean(lockedReason) && idx > clampedStep;
    const leftConnectorClass = idx > 0 && idx <= clampedStep ? 'bg-green-500' : 'bg-slate-200';
    const rightConnectorClass = idx < clampedStep ? 'bg-green-500' : 'bg-slate-200';

    return {
      ...step,
      idx,
      status,
      isLocked,
      leftConnectorClass,
      rightConnectorClass,
    };
  });

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
      <ol className="space-y-3 sm:hidden" aria-label="Election progress">
        {resolvedSteps.map((step) => (
          <li key={step.id} className="relative pl-14">
            {step.idx < resolvedSteps.length - 1 && (
              <div
                className={`absolute left-5 top-10 h-[calc(100%-1rem)] w-px ${step.rightConnectorClass}`}
                aria-hidden="true"
              />
            )}

            <div
              className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                step.status === 'complete'
                  ? 'border-green-600 bg-green-600 text-white'
                  : step.status === 'current'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              aria-hidden="true"
            >
              {step.status === 'complete' ? <Check className="h-4 w-4" /> : step.idx + 1}
            </div>

            <div
              className={`rounded-2xl px-4 py-3 transition-colors ${
                step.status === 'current'
                  ? 'bg-slate-50'
                  : step.status === 'complete'
                    ? 'bg-green-50'
                    : 'bg-slate-50/60'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  step.status === 'complete'
                    ? 'text-green-700'
                    : step.status === 'current'
                      ? 'text-slate-900'
                      : 'text-slate-700'
                }`}
              >
                {step.title}
              </p>

              {step.description && (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {step.description}
                </p>
              )}

              {step.isLocked && (
                <span className="mt-2 inline-flex text-xs font-medium uppercase tracking-wide text-slate-400">
                  Locked
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="hidden overflow-x-auto sm:block">
        <ol
          className="grid min-w-[640px] gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))` }}
          aria-label="Election progress"
        >
          {resolvedSteps.map((step) => {
            return (
              <li key={step.id} className="relative">
                <div
                  className={`relative flex flex-col items-center rounded-2xl px-3 py-2 text-center transition-colors ${
                    step.status === 'current'
                      ? 'bg-slate-50'
                      : step.status === 'complete'
                        ? 'bg-green-50'
                        : 'bg-transparent'
                  }`}
                >
                  <div className="relative flex h-10 w-full items-center justify-center">
                    {step.idx > 0 && (
                      <div
                        className={`absolute left-[-0.75rem] right-1/2 top-1/2 h-px -translate-y-1/2 ${step.leftConnectorClass}`}
                        aria-hidden="true"
                      />
                    )}

                    {step.idx < resolvedSteps.length - 1 && (
                      <div
                        className={`absolute left-1/2 right-[-0.75rem] top-1/2 h-px -translate-y-1/2 ${step.rightConnectorClass}`}
                        aria-hidden="true"
                      />
                    )}

                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      step.status === 'complete'
                        ? 'border-green-600 bg-green-600 text-white'
                        : step.status === 'current'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                    aria-hidden="true"
                  >
                    {step.status === 'complete' ? <Check className="h-4 w-4" /> : step.idx + 1}
                  </div>
                  </div>

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      step.status === 'complete'
                        ? 'text-green-700'
                        : step.status === 'current'
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

                  {step.isLocked && (
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
