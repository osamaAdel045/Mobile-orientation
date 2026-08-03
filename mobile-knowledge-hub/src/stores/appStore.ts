import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types/framework'

interface AppState {
  // Navigation
  currentFramework: string
  currentSection: number

  // Compare mode
  isCompareMode: boolean
  compareLeft: string
  compareRight: string

  // Theme
  theme: ThemeMode

  // Search
  isSearchOpen: boolean

  // Actions
  setFramework: (id: string) => void
  setSection: (num: number) => void
  navigateTo: (fw: string, section: number) => void
  toggleCompare: () => void
  enterCompare: (left?: string, right?: string) => void
  exitCompare: () => void
  setCompareLeft: (id: string) => void
  setCompareRight: (id: string) => void
  toggleTheme: () => void
  setTheme: (t: ThemeMode) => void
  openSearch: () => void
  closeSearch: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      currentFramework: 'flutter',
      currentSection: 1,
      isCompareMode: false,
      compareLeft: 'flutter',
      compareRight: 'react-native',
      theme: 'dark',
      isSearchOpen: false,

      setFramework: id => set({ currentFramework: id, currentSection: 1 }),
      setSection: num => set({ currentSection: num }),
      navigateTo: (fw, section) => set({ currentFramework: fw, currentSection: section }),

      toggleCompare: () => {
        const { isCompareMode } = get()
        if (isCompareMode) {
          set({ isCompareMode: false })
        } else {
          set({
            isCompareMode: true,
            compareLeft: get().currentFramework,
            compareRight: get().currentFramework === 'flutter' ? 'react-native' : 'flutter',
          })
        }
      },

      enterCompare: (left, right) =>
        set({
          isCompareMode: true,
          compareLeft: left || get().currentFramework,
          compareRight: right || 'react-native',
        }),

      exitCompare: () => set({ isCompareMode: false }),

      setCompareLeft: id => set({ compareLeft: id }),
      setCompareRight: id => set({ compareRight: id }),

      toggleTheme: () =>
        set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      setTheme: t => set({ theme: t }),

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
    }),
    {
      name: 'mkh-storage',
      partialize: state => ({ theme: state.theme }),
    },
  ),
)
