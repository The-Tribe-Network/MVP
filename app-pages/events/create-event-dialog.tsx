'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Plan a new event for your tribe. You can add voting options if you need input from members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="event-title">Event Title</Label>
            <Input id="event-title" placeholder="Summer BBQ Party" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-date">Date</Label>
              <Input id="event-date" type="date" />
            </div>
            <div>
              <Label htmlFor="event-time">Time</Label>
              <Input id="event-time" type="time" />
            </div>
          </div>

          <div>
            <Label htmlFor="event-location">Location</Label>
            <Input id="event-location" placeholder="Central Park" />
          </div>

          <div>
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Tell members about the event..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="event-type">Event Type</Label>
            <Select defaultValue="confirmed">
              <SelectTrigger id="event-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed Event</SelectItem>
                <SelectItem value="voting">Needs Voting (Location, Time, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Create Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

