import { Search, Sun, Moon, Columns2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

export function Header() {
  const theme = useAppStore(s => s.theme)
  const toggleTheme = useAppStore(s => s.toggleTheme)
  const openSearch = useAppStore(s => s.openSearch)
  const isCompareMode = useAppStore(s => s.isCompareMode)
  const toggleCompare = useAppStore(s => s.toggleCompare)

  return (
    <header
      className="header-bar"
      role="banner"
    >
      <div className="header-inner">
        {/* Logo */}
        <button
          onClick={() => {
            useAppStore.getState().exitCompare()
            useAppStore.getState().navigateTo('flutter', 1)
          }}
          className="header-logo"
          aria-label="Mobile Engineering Hub — Home"
        >
          <span className="header-logo-icon">◈</span>
          <span className="header-logo-text">Mobile Engineering Hub</span>
        </button>

        {/* Actions */}
        <div className="header-actions">
          {/* Search */}
          <button
            onClick={openSearch}
            className="header-btn header-search-btn"
            aria-label="Search (Cmd+K)"
            title="Search documentation (Cmd+K)"
          >
            <Search size={16} />
            <span>Search</span>
            <kbd className="header-kbd">⌘K</kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-icon-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Compare Toggle */}
          <button
            onClick={toggleCompare}
            className={`header-btn ${isCompareMode ? 'header-btn-active' : ''}`}
            aria-label={isCompareMode ? 'Exit compare mode' : 'Compare frameworks'}
          >
            <Columns2 size={16} />
            <span>{isCompareMode ? 'Exit Compare' : 'Compare'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
