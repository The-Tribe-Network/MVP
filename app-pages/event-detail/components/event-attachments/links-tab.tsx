'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link as LinkIcon, ExternalLink, X } from 'lucide-react'
import type { LinkAttachment } from '../../lib/types'

interface LinksTabProps {
  links: LinkAttachment[]
  onAddLink: (url: string) => void
}

export function LinksTab({ links, onAddLink }: LinksTabProps) {
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [showAddLink, setShowAddLink] = useState(false)

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return

    onAddLink(newLinkUrl)
    setNewLinkUrl('')
    setShowAddLink(false)
  }

  return (
    <div className="space-y-4">
      {!showAddLink ? (
        <Button onClick={() => setShowAddLink(true)} variant="outline" className="w-full" size="sm">
          <LinkIcon className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Paste URL here..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
            <Button onClick={handleAddLink} size="sm">
              Add
            </Button>
            <Button
              onClick={() => {
                setShowAddLink(false)
                setNewLinkUrl('')
              }}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LinkIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No links added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share useful links related to the event</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <Card key={link.id} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex gap-3">
                  {link.thumbnail && (
                    <div className="w-16 h-16 rounded bg-muted flex-shrink-0">
                      <img src={link.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate mb-1">{link.title || link.url}</h4>
                    {link.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{link.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Added by {link.addedBy.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
