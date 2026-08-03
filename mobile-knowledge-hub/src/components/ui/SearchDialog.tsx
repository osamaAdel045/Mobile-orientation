import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { FRAMEWORKS, getSectionTitle } from '@/data/frameworks'
import { getCategoryForSection } from '@/data/categories'

interface SearchResult {
  frameworkId: string
  frameworkName: string
  frameworkColor: string
  sectionNum: number
  sectionTitle: string
  category: string
}

export function SearchDialog() {
  const closeSearch = useAppStore(s => s.closeSearch)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Build search index
  const searchIndex = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = []
    for (const fw of FRAMEWORKS) {
      for (let i = 1; i <= 24; i++) {
        const cat = getCategoryForSection(i)
        results.push({
          frameworkId: fw.id,
          frameworkName: fw.name,
          frameworkColor: fw.color,
          sectionNum: i,
          sectionTitle: getSectionTitle(i),
          category: cat?.title || '',
        })
      }
    }
    return results
  }, [])

  // Filter results
  const filtered = useMemo(() => {
    if (!query.trim()) return searchIndex
    const q = query.toLowerCase()
    return searchIndex.filter(
      r =>
        r.frameworkName.toLowerCase().includes(q) ||
        r.sectionTitle.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    )
  }, [query, searchIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      closeSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && filtered[selectedIdx]) {
      const r = filtered[selectedIdx]
      handleSelect(r)
    }
  }

  function handleSelect(result: SearchResult) {
    closeSearch()
    navigate(`/framework/${result.frameworkId}/section/${result.sectionNum}`)
  }

  // Group results by framework
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of filtered) {
      if (!map.has(r.frameworkId)) map.set(r.frameworkId, [])
      map.get(r.frameworkId)!.push(r)
    }
    return map
  }, [filtered])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search sections"
      onClick={e => {
        if (e.target === e.currentTarget) closeSearch()
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl overflow-hidden animate-slide-up shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search frameworks, sections, topics..."
            className="flex-1 bg-transparent border-none outline-none text-base"
            style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={closeSearch}
            className="p-1 rounded cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No results found for "{query}"
            </div>
          ) : (
            Array.from(grouped.entries()).map(([fwId, results]) => {
              const fw = FRAMEWORKS.find(f => f.id === fwId)
              return (
                <div key={fwId} className="mb-2">
                  <div
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: fw?.color || 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fw?.name || fwId}
                  </div>
                  {results.map(r => {
                    const globalIdx = filtered.indexOf(r)
                    return (
                      <button
                        key={`${r.frameworkId}-${r.sectionNum}`}
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className={`w-full text-left px-4 py-2.5 rounded-md transition-colors cursor-pointer border-none ${
                          globalIdx === selectedIdx ? 'selected' : ''
                        }`}
                        style={{
                          background: globalIdx === selectedIdx ? 'rgba(212,168,83,0.1)' : 'transparent',
                          color: 'var(--text-primary)',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span className="text-sm font-medium">{r.sectionTitle}</span>
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          {r.category}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2 border-t text-xs flex gap-4"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
