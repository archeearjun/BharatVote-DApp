import React from 'react';

interface StepWizardProps {
  steps: string[];
  currentStep: number;
}

/**
 * Vertical left-step wizard to guide multi-step flows
 */
const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep }) => (
  <ol className="space-y-4">
    {steps.map((step, idx) => (
      <li key={idx} className="flex items-start">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 text-sm font-bold \
            ${currentStep === idx ? 'bg-[#1f2d54] text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          {idx + 1}
        </div>
        <span className={`${currentStep === idx ? 'text-[#1f2d54]' : 'text-gray-700'}`}>{step}</span>
      </li>
    ))}
  </ol>
);

export default StepWizard; 