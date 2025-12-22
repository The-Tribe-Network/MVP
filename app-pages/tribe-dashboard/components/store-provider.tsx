'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'
import { useStore } from 'zustand'
import { createTribeDashboardStore, type TribeDashboardStore } from '@/app-pages/tribe-dashboard/lib/store'

export type TribeDashboardStoreApi = ReturnType<typeof createTribeDashboardStore>;

export const TribeDashboardStoreContext = createContext<TribeDashboardStoreApi | undefined>(undefined);

export const TribeDashboardStoreProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => createTribeDashboardStore())

  return <TribeDashboardStoreContext.Provider value={store}>{children}</TribeDashboardStoreContext.Provider>
}

export const useTribeDashboardStore = <T,>(selector: (store: TribeDashboardStore) => T): T => {
  const store = useContext(TribeDashboardStoreContext)
  if (!store) {
    throw new Error('TribeDashboardStoreContext not found')
  }
  return useStore(store, selector)
}