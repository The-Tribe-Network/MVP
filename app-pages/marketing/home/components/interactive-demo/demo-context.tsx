'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { mockTribes, DEFAULT_TRIBE_ID } from './mock-data'
import type { DemoTribe, DemoPost } from './types'

interface PostLikeState {
  isLiked: boolean
  likeCount: number
}

interface DemoContextValue {
  activeTribeId: string
  activeTribe: DemoTribe
  tribes: DemoTribe[]
  setActiveTribe: (tribeId: string) => void
  togglePostLike: (postId: string) => void
  getPostLikeState: (postId: string) => PostLikeState
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeTribeId, setActiveTribeId] = useState(DEFAULT_TRIBE_ID)

  // Store like states per tribe: { tribeId: { postId: { isLiked, likeCount } } }
  const [likeStates, setLikeStates] = useState<Record<string, Record<string, PostLikeState>>>(() => {
    // Initialize with default values from mock data
    const initialStates: Record<string, Record<string, PostLikeState>> = {}
    mockTribes.forEach((tribe) => {
      initialStates[tribe.id] = {}
      tribe.posts.forEach((post) => {
        initialStates[tribe.id][post.id] = {
          isLiked: post.isLiked,
          likeCount: post.likeCount,
        }
      })
    })
    return initialStates
  })

  const activeTribe = useMemo(() => {
    return mockTribes.find((t) => t.id === activeTribeId) ?? mockTribes[0]
  }, [activeTribeId])

  const setActiveTribe = useCallback((tribeId: string) => {
    const tribe = mockTribes.find((t) => t.id === tribeId)
    if (tribe) {
      setActiveTribeId(tribeId)
    }
  }, [])

  const togglePostLike = useCallback((postId: string) => {
    setLikeStates((prev) => {
      const tribeState = prev[activeTribeId] ?? {}
      const currentState = tribeState[postId]
      if (!currentState) return prev

      return {
        ...prev,
        [activeTribeId]: {
          ...tribeState,
          [postId]: {
            isLiked: !currentState.isLiked,
            likeCount: currentState.isLiked
              ? currentState.likeCount - 1
              : currentState.likeCount + 1,
          },
        },
      }
    })
  }, [activeTribeId])

  const getPostLikeState = useCallback(
    (postId: string): PostLikeState => {
      const tribeState = likeStates[activeTribeId]
      if (tribeState?.[postId]) {
        return tribeState[postId]
      }
      // Fallback to original post data
      const post = activeTribe.posts.find((p) => p.id === postId)
      return {
        isLiked: post?.isLiked ?? false,
        likeCount: post?.likeCount ?? 0,
      }
    },
    [activeTribeId, likeStates, activeTribe.posts]
  )

  return (
    <DemoContext.Provider
      value={{
        activeTribeId,
        activeTribe,
        tribes: mockTribes,
        setActiveTribe,
        togglePostLike,
        getPostLikeState,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoContext must be used within DemoProvider')
  }
  return context
}
