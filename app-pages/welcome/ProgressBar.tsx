interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`h-2 flex-1 rounded-full transition-colors ${
            step <= currentStep ? 'bg-primary' : 'bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}
