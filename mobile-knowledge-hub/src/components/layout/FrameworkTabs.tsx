import { useNavigate, useParams } from 'react-router-dom'
import { FRAMEWORKS } from '@/data/frameworks'
import { useAppStore } from '@/stores/appStore'

interface FrameworkTabsProps {
  variant?: 'full' | 'compact'
  selectedId?: string
  onSelect?: (id: string) => void
}

export function FrameworkTabs({ variant = 'full', selectedId, onSelect }: FrameworkTabsProps) {
  const navigate = useNavigate()
  const { frameworkId } = useParams<{ frameworkId: string }>()
  const storeFw = useAppStore(s => s.currentFramework)
  const setFramework = useAppStore(s => s.setFramework)
  const isCompareMode = useAppStore(s => s.isCompareMode)

  const activeId = selectedId || frameworkId || storeFw

  function handleClick(fwId: string) {
    if (onSelect) {
      onSelect(fwId)
      return
    }
    setFramework(fwId)
    if (!isCompareMode) {
      navigate(`/framework/${fwId}/section/1`)
    }
  }

  return (
    <nav
      className="tab-bar"
      role="tablist"
      aria-label="Mobile frameworks"
    >
      <div className="tab-bar-inner">
        {FRAMEWORKS.map(fw => (
          <button
            key={fw.id}
            role="tab"
            aria-selected={activeId === fw.id}
            onClick={() => handleClick(fw.id)}
            className={`tab-btn ${activeId === fw.id ? 'active' : ''}`}
            style={{
              borderBottomColor: activeId === fw.id ? 'var(--gold)' : 'transparent',
            }}
          >
            <span
              className="tab-dot"
              style={{ backgroundColor: fw.color }}
            />
            {variant === 'full' ? fw.name : fw.icon}
          </button>
        ))}
      </div>
    </nav>
  )
}
