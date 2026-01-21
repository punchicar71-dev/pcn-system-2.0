'use client';

import { FormStep } from '@/types/vehicle-form.types';

interface StepIndicatorProps {
  currentStep: FormStep;
  completedSteps: FormStep[];
  onStepClick?: (step: FormStep) => void;
}

const steps = [
  { number: 1, title: 'Vehicle' },
  { number: 2, title: 'Seller' },
  { number: 3, title: 'Options' },
  { number: 4, title: 'Selling' },
  { number: 5, title: 'Notes' },
  { number: 6, title: 'Summary' },
  { number: 7, title: 'Publish' },
];

export default function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  const getStepStatus = (stepNumber: FormStep) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  // Check if all steps (1-6) are completed - enables clicking to navigate
  const allStepsCompleted = [1, 2, 3, 4, 5, 6].every(step => 
    completedSteps.includes(step as FormStep)
  );

  const handleStepClick = (stepNumber: FormStep) => {
    // Only allow clicking if all steps are completed and we have a handler
    if (allStepsCompleted && onStepClick && stepNumber <= 6) {
      onStepClick(stepNumber);
    }
  };

  const isClickable = (stepNumber: number) => {
    return allStepsCompleted && stepNumber <= 6;
  };

  return (
    <div className="w-full bg-white sticky top-[50px] z-5">
      <div className="flex items-center justify-start gap-2 px-6 border-b py-4">
        {/* Step Circles */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.number as FormStep);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const clickable = isClickable(step.number);

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle and Label */}
              <div 
                className={`flex items-center gap-2 ${clickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => clickable && handleStepClick(step.number as FormStep)}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    handleStepClick(step.number as FormStep);
                  }
                }}
              >
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300
                    ${
                      isCurrent
                        ? 'bg-green-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                    ${clickable ? 'hover:ring-2 hover:ring-green-300 hover:ring-offset-1' : ''}
                  `}
                >
                  {step.number}
                </div>
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap
                    ${isCurrent || isCompleted ? 'text-green-600' : 'text-gray-500'}
                    ${clickable ? 'hover:underline' : ''}
                  `}
                >
                  {step.title}
                </span>
              </div>
              
              {/* Connector Line - show between steps except after last */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-10 h-0.5 mx-3
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
