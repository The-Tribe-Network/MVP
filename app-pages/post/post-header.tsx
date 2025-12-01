'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function PostHeader() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  )
}

