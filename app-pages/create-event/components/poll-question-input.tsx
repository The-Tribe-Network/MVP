"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PollQuestionInputProps {
  value: string
  onChange: (value: string) => void
}

export function PollQuestionInput({ value, onChange }: PollQuestionInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="poll-question">Poll Question *</Label>
      <Input
        id="poll-question"
        placeholder="e.g., What food should we order?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
