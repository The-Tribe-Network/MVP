'use client'

import { cn } from '@/lib/utils'
import { FileText, Upload, Image, Check } from 'lucide-react'

export type CreateAlbumStep = 'album-details' | 'upload-media' | 'select-media'

interface CreateAlbumNavigationProps {
  activeStep: CreateAlbumStep
  onStepChange: (step: CreateAlbumStep) => void
  completedSteps: Set<CreateAlbumStep>
  canNavigateToStep: (step: CreateAlbumStep) => boolean
}

interface NavItem {
  id: CreateAlbumStep
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    id: 'album-details',
    label: 'Album Details',
    description: 'Name, description & cover',
    icon: FileText,
  },
  {
    id: 'upload-media',
    label: 'Upload Media',
    description: 'Add new photos',
    icon: Upload,
  },
  {
    id: 'select-media',
    label: 'Select Media',
    description: 'Choose existing photos',
    icon: Image,
  },
]

export function CreateAlbumNavigation({
  activeStep,
  onStepChange,
  completedSteps,
  canNavigateToStep,
}: CreateAlbumNavigationProps) {
  return (
    <nav className="w-64 shrink-0">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeStep === item.id
          const isCompleted = completedSteps.has(item.id)
          const canNavigate = canNavigateToStep(item.id)

          return (
            <button
              key={item.id}
              onClick={() => canNavigate && onStepChange(item.id)}
              disabled={!canNavigate}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : canNavigate
                    ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    : 'text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              <div className="relative mt-0.5">
                <Icon className="h-5 w-5 shrink-0" />
                {isCompleted && !isActive && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {item.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
