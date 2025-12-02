"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Clock, FileText, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { createEventSchema, type CreateEventInput } from "@/lib/validations/event"
import { toast } from "sonner"

interface CreateEventPageProps {
  tribeId: string
}

const STEPS = [
  { id: 1, name: "Basic Info", description: "Event title and description" },
  { id: 2, name: "Date & Time", description: "When is your event?" },
  { id: 3, name: "Location", description: "Where will it take place?" },
  { id: 4, name: "Review", description: "Review and submit" },
]

export function CreateEventPage({ tribeId }: CreateEventPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
    },
  })

  const progress = (currentStep / STEPS.length) * 100

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateEventInput)[] = []

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
    }

    const isValid = await form.trigger(fieldsToValidate)

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: CreateEventInput) => {
    setIsSubmitting(true)

    try {
      // TODO: Implement API call to create event
      // const response = await fetch(`/api/tribes/${tribeId}/events`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // })

      console.log("Creating event:", data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success("Event created successfully!")
      router.push(`/tribe/${tribeId}/events`)
    } catch (error) {
      console.error("Failed to create event:", error)
      toast.error("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details to create an event for your tribe
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      currentStep > step.id
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">{step.name}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Give your event a title and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Summer BBQ Party"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about your event..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add details like what to bring, dress code, or special instructions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Date & Time
                </CardTitle>
                <CardDescription>
                  When will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":")
                                const newDate = field.value ? new Date(field.value) : new Date()
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does your event start?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick an end date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":")
                                const newDate = field.value ? new Date(field.value) : new Date()
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank if it's a single point in time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Where will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Central Park, New York or Online via Zoom"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a physical address or specify if it's a virtual event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Review your event details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Event Title
                    </h3>
                    <p className="text-lg font-semibold">
                      {form.getValues("title") || "No title provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="text-sm">
                      {form.getValues("description") || "No description provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Start Date
                      </h3>
                      <p className="text-sm">
                        {form.getValues("startDate")
                          ? format(form.getValues("startDate")!, "PPP 'at' p")
                          : "No start date provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        End Date
                      </h3>
                      <p className="text-sm">
                        {form.getValues("endDate")
                          ? format(form.getValues("endDate")!, "PPP 'at' p")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Location
                    </h3>
                    <p className="text-sm">
                      {form.getValues("location") || "No location provided"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Once submitted, your event will be visible to all tribe members.
                    They can RSVP and see all the details you've provided.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
