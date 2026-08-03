import type { FC, ReactNode } from 'react'

export const StatGrid: FC<{ columns?: 3 | 4; children: ReactNode }> = ({ columns = 4, children }) => (
  <div className={`stat-grid${columns === 3 ? ' cols-3' : ''}`}>{children}</div>
)

export const StatItem: FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="stat-card">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
)

export const CodeBlock: FC<{ language?: string; children: ReactNode }> = ({ language, children }) => (
  <div className="code-block">
    {language && <span className="lang-badge">{language}</span>}
    <pre><code>{children}</code></pre>
  </div>
)

export const Callout: FC<{ type?: 'info' | 'warning' | 'tip'; title?: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="callout">
    {title && <div className="callout-title">{title}</div>}
    {children}
  </div>
)

export const DecisionMatrix: FC<{
  scores: { label: string; score: number }[]
  pros?: string
  cons?: string
}> = ({ scores, pros, cons }) => (
  <div>
    <div className="stat-grid cols-3">
      {scores.map(s => (
        <div className="stat-card" key={s.label}>
          <span className="stat-value">{s.score}/5</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
    {pros && (
      <div className="callout" style={{ borderLeftColor: 'var(--fw-android)' }}>
        <div className="callout-title">When to Choose</div>
        <p>{pros}</p>
      </div>
    )}
    {cons && (
      <div className="callout" style={{ borderLeftColor: 'var(--fw-ios)' }}>
        <div className="callout-title">When Not</div>
        <p>{cons}</p>
      </div>
    )}
  </div>
)
