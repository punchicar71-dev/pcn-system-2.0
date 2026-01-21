'use client';

interface ReserveVehicleStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
}

const steps = [
  { number: 1, title: 'Details' },
  { number: 2, title: 'Reserve Info' },
  { number: 3, title: 'Confirmation' },
];

export default function ReserveVehicleStepIndicator({ 
  currentStep, 
  completedSteps 
}: ReserveVehicleStepIndicatorProps) {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full bg-white sticky top-[50px] z-20">
      <div className="flex items-center justify-start gap-2 px-6 border-b py-4">
        {/* Step Circles */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle and Label */}
              <div className="flex items-center gap-2">
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
                  `}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap
                    ${isCurrent || isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}
                >
                  {step.title}
                </span>
              </div>
              
              {/* Connector Line - show between steps except after last */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-16 h-0.5 mx-3
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
