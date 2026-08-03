import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES, getCategoryForSection } from '@/data/categories'
import { getSectionTitle } from '@/data/frameworks'
import { getAllSections } from '@/data/sectionRegistry'
import type { SectionContent } from '@/types/framework'

interface SidebarProps {
  frameworkId: string
  activeSection?: number
  onSelect?: (sectionNum: number) => void
  compact?: boolean
}

export function Sidebar({ frameworkId, activeSection, onSelect, compact = false }: SidebarProps) {
  const navigate = useNavigate()
  const { sectionNum } = useParams<{ sectionNum: string }>()
  const activeRef = useRef<HTMLButtonElement>(null)

  const currentSection = activeSection || (sectionNum ? parseInt(sectionNum, 10) : 1)
  const sections: SectionContent[] = getAllSections(frameworkId)
  const hasContent = sections.length > 0

  // Scroll active link into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentSection, frameworkId])

  function handleClick(sectionNum: number) {
    if (onSelect) {
      onSelect(sectionNum)
      return
    }
    navigate(`/framework/${frameworkId}/section/${sectionNum}`)
  }

  // Group sections by category
  const grouped: Record<string, number[]> = {}
  if (hasContent) {
    sections.forEach(s => {
      const cat = getCategoryForSection(s.meta.section)
      const catTitle = cat?.title || 'Other'
      if (!grouped[catTitle]) grouped[catTitle] = []
      grouped[catTitle].push(s.meta.section)
    })
  } else {
    CATEGORIES.forEach(cat => {
      grouped[cat.title] = []
      for (let i = cat.range[0]; i <= cat.range[1]; i++) {
        grouped[cat.title].push(i)
      }
    })
  }

  return (
    <aside
      className={`sidebar-nav${compact ? ' sidebar-nav-compact' : ''}`}
      role="navigation"
      aria-label="Section navigation"
    >
      {Object.entries(grouped).map(([catTitle, nums]) => (
        <div key={catTitle}>
          <div className="side-cat">{catTitle}</div>
          {nums.map(num => (
            <button
              key={num}
              ref={num === currentSection ? activeRef : undefined}
              onClick={() => handleClick(num)}
              className={`side-link ${num === currentSection ? 'active' : ''}`}
              style={compact ? { fontSize: '0.75rem', padding: '0.35rem 0.5rem' } : undefined}
            >
              {getSectionTitle(num)}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
