import React from 'react';

interface StepperProps {
  steps: string[];
  activeIndex: number;
  variant?: 'default' | 'compact';
}

/**
 * Horizontal stepper component - compact variant for admin panel
 */
const Stepper: React.FC<StepperProps> = ({ steps, activeIndex, variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-3 text-center text-xs">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
              <span className={`ml-2 ${
                index <= activeIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`ml-4 w-8 h-0.5 ${
                  index < activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default stepper for KYC
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                index <= activeIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span className={`mt-2 text-xs text-center max-w-20 ${
              index <= activeIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 mx-4 transition-colors ${
                index < activeIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper; 