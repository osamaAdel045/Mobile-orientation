import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { MainLayout } from '@/components/layout/MainLayout'
import { CompareLayout } from '@/components/layout/CompareLayout'
import { SearchDialog } from '@/components/ui/SearchDialog'
import { NotFoundPage } from '@/pages/NotFoundPage'

function FrameworkRedirect() {
  const { frameworkId } = useParams<{ frameworkId: string }>()
  return <Navigate to={`/framework/${frameworkId}/section/1`} replace />
}

function RootRedirect() {
  return <Navigate to="/framework/flutter/section/1" replace />
}

export default function App() {
  const theme = useAppStore(s => s.theme)
  const isSearchOpen = useAppStore(s => s.isSearchOpen)
  const currentFramework = useAppStore(s => s.currentFramework)
  const currentSection = useAppStore(s => s.currentSection)
  const setFramework = useAppStore(s => s.setFramework)
  const setSection = useAppStore(s => s.setSection)
  const isCompareMode = useAppStore(s => s.isCompareMode)

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }, [theme])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      // Cmd+K → open search
      if (meta && e.key === 'k') {
        e.preventDefault()
        useAppStore.getState().openSearch()
        return
      }

      // Escape → close search / exit compare
      if (e.key === 'Escape') {
        if (useAppStore.getState().isSearchOpen) {
          useAppStore.getState().closeSearch()
          return
        }
        if (useAppStore.getState().isCompareMode) {
          useAppStore.getState().exitCompare()
          return
        }
      }

      // Cmd+[1-7] → switch frameworks
      if (meta && e.key >= '1' && e.key <= '7') {
        e.preventDefault()
        const idx = parseInt(e.key, 10) - 1
        const fwIds = ['flutter', 'react-native', 'android', 'ios', 'kmm', 'maui', 'ionic']
        if (fwIds[idx]) {
          if (isCompareMode) {
            // In compare mode, change the left side
            useAppStore.getState().setCompareLeft(fwIds[idx])
          } else {
            setFramework(fwIds[idx])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCompareMode, setFramework, setSection])

  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/framework/:frameworkId" element={<FrameworkRedirect />} />
        <Route path="/framework/:frameworkId/section/:sectionNum" element={<MainLayout />} />
        <Route path="/compare/:leftId/:rightId" element={<CompareLayout />} />
        <Route path="/compare/:leftId/:rightId/section/:sectionNum" element={<CompareLayout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isSearchOpen && <SearchDialog />}
    </>
  )
}
