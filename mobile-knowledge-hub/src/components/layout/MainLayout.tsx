import { useEffect } from 'react'
import { useParams, Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { getFramework } from '@/data/frameworks'
import { Header } from './Header'
import { FrameworkTabs } from './FrameworkTabs'
import { Sidebar } from './Sidebar'
import { SectionPage } from '@/pages/SectionPage'
import { Phase2Teaser } from '@/components/ui/Phase2Teaser'
import { Footer } from '@/components/ui/Footer'

export function MainLayout() {
  const { frameworkId, sectionNum } = useParams<{ frameworkId: string; sectionNum: string }>()
  const navigate = useNavigate()
  const setFramework = useAppStore(s => s.setFramework)
  const setSection = useAppStore(s => s.setSection)
  const isCompareMode = useAppStore(s => s.isCompareMode)

  const fwId = frameworkId || 'flutter'
  const secNum = sectionNum ? parseInt(sectionNum, 10) : 1
  const fw = getFramework(fwId)

  // Redirect if compare mode is active
  useEffect(() => {
    if (isCompareMode) {
      const left = useAppStore.getState().compareLeft
      const right = useAppStore.getState().compareRight
      navigate(`/compare/${left}/${right}/section/${secNum}`, { replace: true })
    }
  }, [isCompareMode])

  // Sync store with URL
  useEffect(() => {
    setFramework(fwId)
    setSection(secNum)
  }, [fwId, secNum, setFramework, setSection])

  if (!fw) {
    return (
      <>
        <Header />
        <div className="content-area p-8 text-center">
          <h2>Framework not found</h2>
          <p>The framework "{fwId}" does not exist.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <FrameworkTabs />

      <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto" style={{ minHeight: 'calc(100vh - 112px)' }}>
        <Sidebar frameworkId={fwId} />

        <main
          id="main-content"
          className="flex-1 min-w-0 animate-fade-in content-area"
        >
          <SectionPage frameworkId={fwId} sectionNum={secNum} fwColor={fw.color} fwTagline={fw.tagline} />
        </main>
      </div>

      <Phase2Teaser />
      <Footer />
    </>
  )
}
