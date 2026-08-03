import { getSection } from '@/data/sectionRegistry'

interface SectionPageProps {
  frameworkId: string
  sectionNum: number
  fwColor: string
  fwTagline: string
}

export function SectionPage({ frameworkId, sectionNum, fwColor, fwTagline }: SectionPageProps) {
  const section = getSection(frameworkId, sectionNum)

  if (!section || !section.Component) {
    return (
      <div className="animate-fade-in pt-4 pb-12 md:pb-16">
        <h2 style={{ color: fwColor }}>{section?.meta.title || `Section ${sectionNum}`}</h2>
        {fwTagline && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            {fwTagline}
          </p>
        )}
        <div
          className="rounded-lg p-8 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            Content for this section is being migrated.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Section {sectionNum} &middot; {frameworkId}
          </p>
        </div>
      </div>
    )
  }

  const { Component, meta } = section

  return (
    <div className="animate-fade-in pt-4 pb-12 md:pb-16">
      <h2 style={{ color: fwColor }}>{meta.title}</h2>
      {fwTagline && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
          {fwTagline}
        </p>
      )}
      <Component />
    </div>
  )
}
