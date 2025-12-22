"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { createEventWithPollSchema, type CreateEventWithPollInput } from "@/lib/validations/event"
import { toast } from "sonner"
import { useCreateEvent } from "@/lib/hooks/use-events"
import { EventCreationStepper } from "./components/event-creation-stepper"
import { StepNavigation } from "./components/step-navigation"
import { BasicInfoStep } from "./steps/basic-info-step"
import { DateTimeStep } from "./steps/date-time-step"
import { LocationStep } from "./steps/location-step"
import { PollStep } from "./steps/poll-step"
import { ReviewStep } from "./steps/review-step"

interface CreateEventPageProps {
  tribeId: string
}

const STEPS = [
  { id: 1, name: "Basic Info", description: "Event title and description" },
  { id: 2, name: "Date & Time", description: "When is your event?" },
  { id: 3, name: "Location", description: "Where will it take place?" },
  { id: 4, name: "Poll", description: "Add an optional poll" },
  { id: 5, name: "Review", description: "Review and submit" },
]

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
      poll: null,
    },
  })

  // Watch poll value to determine if poll is included
  const pollValue = form.watch('poll')
  const includePoll = pollValue !== null && pollValue !== undefined

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateEventWithPollInput)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["title", "description"]
        break
      case 2:
        fieldsToValidate = ["startDate", "endDate"]
        break
      case 3:
        fieldsToValidate = ["location"]
        break
      case 4:
        fieldsToValidate = ["poll"]
        break
    }

    const isValid = fieldsToValidate.length > 0
      ? await form.trigger(fieldsToValidate)
      : true

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: CreateEventWithPollInput) => {
    createEvent(
      { tribeId, data },
      {
        onSuccess: () => {
          toast.success("Event created successfully!")
          form.reset()
          router.push(`/tribe/${tribeId}/events`)
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
        return <BasicInfoStep control={form.control} />
      case 2:
        return <DateTimeStep control={form.control} />
      case 3:
        return <LocationStep control={form.control} />
      case 4:
        return <PollStep control={form.control} />
      case 5:
        return <ReviewStep formData={form.getValues()} />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-3xl pt-16 pb-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details to create an event for your tribe
        </p>
      </div>

      <EventCreationStepper currentStep={currentStep} steps={STEPS} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStep()}

          <StepNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            isSubmitting={isSubmitting}
            onPrevious={prevStep}
            onNext={nextStep}
            onSubmit={() => {}}
          />
        </form>
      </Form>
    </div>
  )
}
