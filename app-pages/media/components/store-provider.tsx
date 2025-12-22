'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'
import { useStore } from 'zustand'
import { createTribeMediaPageStore, type TribeMediaPageStore } from '../lib/store';

export type TribeMediaPageStoreApi = ReturnType<typeof createTribeMediaPageStore>;

export const TribeMediaPageStoreContext = createContext<TribeMediaPageStoreApi | undefined>(undefined);

export const TribeMediaPageStoreProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => createTribeMediaPageStore())

  return <TribeMediaPageStoreContext.Provider value={store}>{children}</TribeMediaPageStoreContext.Provider>
}

export const useTribeMediaPageStore = <T,>(selector: (store: TribeMediaPageStore) => T): T => {
  const store = useContext(TribeMediaPageStoreContext)
  if (!store) {
    throw new Error('TribeMediaPageStoreContext not found')
  }
  return useStore(store, selector)
}