'use client';

import { Check } from 'lucide-react';
import { FormStep } from '@/types/vehicle-form.types';

interface StepIndicatorProps {
  currentStep: FormStep;
  completedSteps: FormStep[];
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

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const getStepStatus = (stepNumber: FormStep) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Circles */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.number as FormStep);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <div key={step.number} className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 border-2
                  ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-white border-green-500 text-green-500'
                      : 'bg-white border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <div
                className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${isCurrent ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-400'}
                `}
              >
                {step.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
