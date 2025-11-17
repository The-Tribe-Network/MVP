import { create } from "zustand"
import { devtools } from "zustand/middleware"

// UI-only state management
interface UIState {
  // Theme and appearance
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  
  // Loading states for UI components
  globalLoading: boolean
  
  // Notifications and toasts
  notifications: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    message: string
    timestamp: number
  }>

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean) => void
  addNotification: (notification: Omit<UIState["notifications"][0], "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      theme: "system",
      sidebarOpen: false,
      globalLoading: false,
      notifications: [],

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setGlobalLoading: (globalLoading) => set({ globalLoading }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          }
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "ui-store",
    },
  ),
)
