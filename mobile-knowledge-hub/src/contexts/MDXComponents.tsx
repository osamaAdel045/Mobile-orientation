import type { ComponentProps, FC } from 'react'
import { MDXProvider } from '@mdx-js/react'

// These will be replaced with full implementations in Phase 4
const StatGrid: FC<{ columns?: 3 | 4; children: React.ReactNode }> = ({ columns = 4, children }) => (
  <div className={`stat-grid${columns === 3 ? ' cols-3' : ''}`}>{children}</div>
)

const StatItem: FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="stat-card">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
)

const CodeBlock: FC<{ language?: string; children: React.ReactNode }> = ({ language, children }) => (
  <div className="code-block">
    {language && <span className="lang-badge">{language}</span>}
    <pre><code>{children}</code></pre>
  </div>
)

const Callout: FC<{ type?: 'info' | 'warning' | 'tip'; title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="callout">
    {title && <div className="callout-title">{title}</div>}
    {children}
  </div>
)

const DecisionMatrix: FC<{
  scores: { label: string; score: number }[]
  pros?: string
  cons?: string
}> = ({ scores, pros, cons }) => (
  <div>
    <div className={`stat-grid cols-3`}>
      {scores.map(s => (
        <div className="stat-card" key={s.label}>
          <span className="stat-value">{s.score}/5</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
    {pros && (
      <div className="callout" style={{ borderLeftColor: 'var(--fw-android)' }}>
        <div className="callout-title">✅ When to Choose</div>
        <p>{pros}</p>
      </div>
    )}
    {cons && (
      <div className="callout" style={{ borderLeftColor: 'var(--fw-ios)' }}>
        <div className="callout-title">❌ When Not</div>
        <p>{cons}</p>
      </div>
    )}
  </div>
)

// Map component names to implementations
const mdxComponents = {
  StatGrid,
  StatItem,
  CodeBlock,
  Callout,
  DecisionMatrix,
  // HTML elements get passed through as-is in MDX
  h3: (props: ComponentProps<'h3'>) => <h3 {...props} />,
  p: (props: ComponentProps<'p'>) => <p {...props} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.85rem' }} />,
  ul: (props: ComponentProps<'ul'>) => <ul {...props} style={{ color: 'var(--text-secondary)' }} />,
  ol: (props: ComponentProps<'ol'>) => <ol {...props} style={{ color: 'var(--text-secondary)' }} />,
  li: (props: ComponentProps<'li'>) => <li {...props} />,
  strong: (props: ComponentProps<'strong'>) => <strong {...props} style={{ color: 'var(--text-primary)', fontWeight: 600 }} />,
  code: (props: ComponentProps<'code'>) => (
    <code
      {...props}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.82rem',
        background: 'var(--bg-code)',
        padding: '0.15rem 0.4rem',
        borderRadius: '4px',
        color: 'var(--copper)',
      }}
    />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a {...props} style={{ color: 'var(--teal)', textDecoration: 'underline', textUnderlineOffset: '3px' }} />
  ),
  pre: (props: ComponentProps<'pre'>) => <pre {...props} />,
}

export function MDXComponentsProvider({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>
}
