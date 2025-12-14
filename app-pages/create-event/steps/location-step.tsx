"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Control } from "react-hook-form"
import type { CreateEventInput } from "@/lib/validations/event"

interface LocationStepProps {
  control: Control<CreateEventInput>
}

export function LocationStep({ control }: LocationStepProps) {
  return (
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
          control={control}
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
  )
}
