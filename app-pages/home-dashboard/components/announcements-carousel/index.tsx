'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Announcement } from '../../lib/types'

interface AnnouncementsCarouselProps {
  announcements: Announcement[]
  autoPlayInterval?: number
}

export default function AnnouncementsCarousel({
  announcements,
  autoPlayInterval = 5000
}: AnnouncementsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Take only the 3 most recent announcements
  const displayAnnouncements = announcements.slice(0, 3)

  useEffect(() => {
    if (isPaused || displayAnnouncements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayAnnouncements.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPaused, displayAnnouncements.length, autoPlayInterval])

  if (displayAnnouncements.length === 0) {
    return null
  }

  const currentAnnouncement = displayAnnouncements[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayAnnouncements.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayAnnouncements.length)
  }

  return (
    <Card
      className="border-border/50 bg-card/50 p-4 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-primary/10 p-2">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={currentAnnouncement.tribe.avatar} />
              <AvatarFallback className="text-[10px]">
                {currentAnnouncement.tribe.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {currentAnnouncement.tribe.name}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {currentAnnouncement.timestamp}
            </span>
          </div>

          <h4 className="font-semibold text-sm text-foreground truncate">
            {currentAnnouncement.title}
          </h4>
        </div>

        {displayAnnouncements.length > 1 && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToNext}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Progress indicators */}
      {displayAnnouncements.length > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {displayAnnouncements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-4 bg-primary'
                  : 'w-1 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
