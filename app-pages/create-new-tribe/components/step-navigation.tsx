"use client"

import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function StepNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex justify-between mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {!isLastStep ? (
        <Button type="button" onClick={onNext}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Creating..." : "Create Tribe"}
          <Check className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  )
}
