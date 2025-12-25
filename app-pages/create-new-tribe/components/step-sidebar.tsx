"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
}

interface StepSidebarProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
  className?: string
}

export function StepSidebar({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepSidebarProps) {
  return (
    <div className={cn("w-48", className)}>
      <nav className="space-y-1">
        {steps.map((step) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                isActive && "bg-accent",
                !isActive && "hover:bg-muted"
              )}
            >
              <StepIndicator
                step={step.id}
                isActive={isActive}
                isCompleted={isCompleted}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive && "text-foreground",
                  !isActive && isCompleted && "text-muted-foreground",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function StepIndicator({
  step,
  isActive,
  isCompleted,
}: {
  step: number
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
        isActive && "border-primary bg-primary text-primary-foreground",
        isCompleted && "border-primary bg-primary text-primary-foreground",
        !isActive && !isCompleted && "border-muted-foreground/40 text-muted-foreground"
      )}
    >
      {isCompleted ? <Check className="h-4 w-4" /> : step}
    </div>
  )
}
