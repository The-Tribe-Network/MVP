"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Vote,
  Calendar
} from "lucide-react"
import type { Poll, PollOption } from "./event-polls-section"

interface CreatePollSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'createdBy'>) => void
}

export function CreatePollSheet({ 
  open, 
  onOpenChange, 
  onCreatePoll 
}: CreatePollSheetProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [hasDeadline, setHasDeadline] = useState(false)
  const [deadline, setDeadline] = useState("")

  const resetForm = () => {
    setQuestion("")
    setOptions(["", ""])
    setAllowMultiple(false)
    setIsAnonymous(false)
    setHasDeadline(false)
    setDeadline("")
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.trim() !== "")
    if (question.trim() === "" || validOptions.length < 2) return

    const pollOptions: PollOption[] = validOptions.map((text, index) => ({
      id: `new-opt-${index}`,
      text: text.trim(),
      votes: 0,
      voters: []
    }))

    onCreatePoll({
      question: question.trim(),
      options: pollOptions,
      allowMultiple,
      isAnonymous,
      endsAt: hasDeadline && deadline ? new Date(deadline) : null,
      userVotes: []
    })

    resetForm()
  }

  const isValid = question.trim() !== "" && options.filter(opt => opt.trim() !== "").length >= 2

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Create New Poll
          </SheetTitle>
          <SheetDescription>
            Ask the group a question and let everyone vote on their preferred option.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 pb-6">
            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium">
                Question
              </Label>
              <Input
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Options ({options.length}/10)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  disabled={options.length >= 10}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="text-muted-foreground/50 cursor-grab">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="relative flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="h-9 pr-8"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Settings</Label>
              
              <div className="space-y-4">
                {/* Allow Multiple */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multiple" className="text-sm font-normal cursor-pointer">
                      Allow multiple choices
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Let users select more than one option
                    </p>
                  </div>
                  <Switch
                    id="multiple"
                    checked={allowMultiple}
                    onCheckedChange={setAllowMultiple}
                  />
                </div>

                {/* Anonymous Voting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                      Anonymous voting
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Hide who voted for each option
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="deadline-toggle" className="text-sm font-normal cursor-pointer">
                        Set deadline
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically close voting on a specific date
                      </p>
                    </div>
                    <Switch
                      id="deadline-toggle"
                      checked={hasDeadline}
                      onCheckedChange={setHasDeadline}
                    />
                  </div>
                  
                  {hasDeadline && (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="pl-10 h-9"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="pt-4 border-t mt-auto">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => handleClose(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!isValid}
              className="flex-1"
            >
              <Vote className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


