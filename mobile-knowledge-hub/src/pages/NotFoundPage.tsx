import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { FrameworkTabs } from '@/components/layout/FrameworkTabs'

export function NotFoundPage() {
  return (
    <>
      <Header />
      <FrameworkTabs />
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="text-center">
          <h1
            className="text-6xl font-bold mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: 'var(--gold)' }}
          >
            404
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Page not found
          </p>
          <Link
            to="/framework/flutter/section/1"
            className="inline-block px-6 py-2.5 rounded-full font-semibold text-sm transition-colors no-underline"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg-deep)',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
