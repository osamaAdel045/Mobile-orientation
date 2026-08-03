import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { getFramework, FRAMEWORKS } from '@/data/frameworks'
import { getSection } from '@/data/sectionRegistry'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function CompareLayout() {
  const { leftId, rightId, sectionNum } = useParams<{
    leftId: string
    rightId: string
    sectionNum: string
  }>()
  const navigate = useNavigate()
  const store = useAppStore()

  const lId = leftId || 'flutter'
  const rId = rightId || 'react-native'
  const secNum = sectionNum ? parseInt(sectionNum, 10) : 1

  const leftFw = getFramework(lId)
  const rightFw = getFramework(rId)

  // Sync store
  useEffect(() => {
    store.enterCompare(lId, rId)
  }, [lId, rId])

  function handleLeftChange(fwId: string) {
    navigate(`/compare/${fwId}/${rId}/section/${secNum}`)
  }

  function handleRightChange(fwId: string) {
    navigate(`/compare/${lId}/${fwId}/section/${secNum}`)
  }

  function handleSectionSelect(sectionNum: number) {
    navigate(`/compare/${lId}/${rId}/section/${sectionNum}`)
  }

  if (!leftFw || !rightFw) {
    return (
      <>
        <Header />
        <div className="p-8 text-center">
          <h2>Invalid framework selection</h2>
        </div>
      </>
    )
  }

  const leftSection = getSection(lId, secNum)
  const rightSection = getSection(rId, secNum)

  return (
    <>
      <Header />

      {/* Compare Selector Bar */}
      <div
        className="flex items-center justify-center gap-3 flex-wrap py-3 px-6 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        role="toolbar"
        aria-label="Compare mode controls"
      >
        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Left:</label>
        <select
          value={lId}
          onChange={e => handleLeftChange(e.target.value)}
          className="px-3 py-1.5 rounded-md border text-sm cursor-pointer"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-card)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {FRAMEWORKS.map(fw => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </select>

        <span style={{ fontFamily: "'Fraunces', Georgia, serif", color: 'var(--gold)', fontWeight: 500 }}>
          vs
        </span>

        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Right:</label>
        <select
          value={rId}
          onChange={e => handleRightChange(e.target.value)}
          className="px-3 py-1.5 rounded-md border text-sm cursor-pointer"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-card)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {FRAMEWORKS.map(fw => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </select>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          &middot; Section {secNum} &middot;
        </span>
      </div>

      {/* Compare Panels */}
      <div className="flex" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {/* Left Panel */}
        <div
          className="flex-1 min-w-0 border-r flex"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-[220px] flex-shrink-0 overflow-y-auto border-r" style={{ borderColor: 'var(--border-subtle)' }}>
            <div
              className="px-3 py-2 font-semibold text-sm"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: leftFw.color }}
            >
              {leftFw.name}
            </div>
            <Sidebar
              frameworkId={lId}
              activeSection={secNum}
              onSelect={handleSectionSelect}
              compact
            />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto content-area">
            <h2 style={{ color: leftFw.color }}>
              {leftSection?.meta.title || `Section ${secNum}`}
            </h2>
            {leftFw.tagline && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                {leftFw.tagline}
              </p>
            )}
            {leftSection?.Component ? (
              <leftSection.Component />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Content being migrated...</p>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-w-0 flex">
          <div className="w-[220px] flex-shrink-0 overflow-y-auto border-r" style={{ borderColor: 'var(--border-subtle)' }}>
            <div
              className="px-3 py-2 font-semibold text-sm"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: rightFw.color }}
            >
              {rightFw.name}
            </div>
            <Sidebar
              frameworkId={rId}
              activeSection={secNum}
              onSelect={handleSectionSelect}
              compact
            />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto content-area">
            <h2 style={{ color: rightFw.color }}>
              {rightSection?.meta.title || `Section ${secNum}`}
            </h2>
            {rightFw.tagline && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                {rightFw.tagline}
              </p>
            )}
            {rightSection?.Component ? (
              <rightSection.Component />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Content being migrated...</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
