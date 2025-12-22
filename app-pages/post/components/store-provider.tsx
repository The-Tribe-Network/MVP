'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'
import { useStore } from 'zustand'
import { createPostDetailPageStore, type PostDetailPageStore } from '../lib/store';

export type PostDetailPageStoreApi = ReturnType<typeof createPostDetailPageStore>;

export const PostDetailPageStoreContext = createContext<PostDetailPageStoreApi | undefined>(undefined);

export const PostDetailPageStoreProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => createPostDetailPageStore())

  return <PostDetailPageStoreContext.Provider value={store}>{children}</PostDetailPageStoreContext.Provider>
}

export const usePostDetailPageStore = <T,>(selector: (store: PostDetailPageStore) => T): T => {
  const store = useContext(PostDetailPageStoreContext)
  if (!store) {
    throw new Error('PostDetailPageStoreContext not found')
  }
  return useStore(store, selector)
}
