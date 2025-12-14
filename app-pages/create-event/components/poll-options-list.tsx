"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PollOptionsListProps {
  options: string[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, value: string) => void
  maxOptions?: number
}

export function PollOptionsList({
  options,
  onAdd,
  onRemove,
  onUpdate,
  maxOptions = 10
}: PollOptionsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Options ({options.length}/{maxOptions}) *</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
          disabled={options.length >= maxOptions}
          className="h-8 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Option
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div className="text-muted-foreground/50">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="relative flex-1">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="pr-8"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Add at least 2 options for attendees to vote on
      </p>
    </div>
  )
}
