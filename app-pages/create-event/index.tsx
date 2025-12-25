"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import {
  createEventWithPollSchema,
  type CreateEventWithPollInput,
} from "@/lib/validations/event"
import { toast } from "sonner"
import { useCreateEvent } from "@/lib/hooks/use-events"
import { SubpageHeader } from "@/components/shared/subpage-header"
import { StepSidebar } from "./components/step-sidebar"
import { StepNavigation } from "./components/step-navigation"
import { DetailsStep } from "./steps/details-step"
import { PollStep } from "./steps/poll-step"
import { ReviewStep } from "./steps/review-step"

interface CreateEventPageProps {
  tribeId: string
}

const STEPS = [
  { id: 1, name: "Details" },
  { id: 2, name: "Poll" },
  { id: 3, name: "Review" },
]

// Map step to fields for validation
const getStepFields = (step: number): (keyof CreateEventWithPollInput)[] => {
  switch (step) {
    case 1:
      return ["title", "description", "startDate", "endDate", "location"]
    case 2:
      return ["poll"]
    case 3:
      return [] // Review step - full validation on submit
    default:
      return []
  }
}

export function CreateEventPage({ tribeId }: CreateEventPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate: createEvent, isPending: isSubmitting } = useCreateEvent()

  const form = useForm<CreateEventWithPollInput>({
    resolver: zodResolver(createEventWithPollSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      coverImageId: null,
      coverImageUrl: null,
      poll: null,
    },
  })

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep)
    const isValid =
      fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = async (targetStep: number) => {
    // Allow going backward without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep)
      return
    }

    // Validate current step before going forward
    const fieldsToValidate = getStepFields(currentStep)
    const isValid =
      fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true

    if (isValid) {
      setCurrentStep(targetStep)
    }
  }

  const handleSubmit = async () => {
    // Only allow submission on the review step
    if (currentStep !== STEPS.length) {
      return
    }

    // Validate entire form before submitting
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Please fix the errors before submitting")
      return
    }

    const data = form.getValues()
    createEvent(
      { tribeId, data },
      {
        onSuccess: (result) => {
          toast.success("Event created successfully!")
          form.reset()
          router.push(`/tribe/${tribeId}/events/${result.id}`)
        },
        onError: (error) => {
          console.error("Failed to create event:", error)
          toast.error(error.message || "Failed to create event. Please try again.")
        },
      }
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DetailsStep control={form.control} tribeId={tribeId} />
      case 2:
        return <PollStep control={form.control} />
      case 3:
        return <ReviewStep formData={form.getValues()} />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl pt-8 pb-8 mx-auto">
      <SubpageHeader
        tribeId={tribeId}
        breadcrumbs={[
          { label: "Events", href: `/tribe/${tribeId}/events` },
          { label: "Create New Event" },
        ]}
        title="Create New Event"
        subtitle="Fill in the details to create an event for your tribe"
        className="mb-8"
      />

      <Form {...form}>
        {/* No native form - prevents accidental submission */}
        <div
          onKeyDown={(e) => {
            // Prevent Enter key from doing anything unexpected
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault()
            }
          }}
        >
          <div className="flex gap-6">
            {/* Left: Sticky Step Navigation (hidden on mobile) */}
            <StepSidebar
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={goToStep}
              className="hidden lg:block sticky self-start top-[72px]"
            />

            {/* Vertical Separator (hidden on mobile) */}
            <Separator orientation="vertical" className="hidden lg:block h-auto" />

            {/* Right: Form Content */}
            <div className="flex-1 min-w-0">
              {renderStep()}

              {/* Bottom Navigation (always visible) */}
              <StepNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                isSubmitting={isSubmitting}
                onPrevious={prevStep}
                onNext={nextStep}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  )
}
