import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  isStepValid: boolean
  onBack: () => void
  onNext?: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  isStepValid,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {currentStep < totalSteps ? (
        <Button onClick={onNext} disabled={!isStepValid || isSubmitting} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={!isStepValid || isSubmitting} className="gap-2">
          {isSubmitting ? 'Creating...' : 'Create Tribe'}
          {!isSubmitting && <Check className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}

