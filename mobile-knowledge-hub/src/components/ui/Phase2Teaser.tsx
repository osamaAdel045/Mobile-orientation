export function Phase2Teaser() {
  const tags = [
    'Database Engineering',
    'Backend Engineering',
    'API Design',
    'System Design',
    'Distributed Systems',
    'Cloud',
    'DevOps',
    'CI/CD',
    'Software Architecture',
    'Design Patterns',
    'Security',
    'Scalability',
  ]

  return (
    <section
      className="border-t py-10 px-6 text-center"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <h3
        className="text-xl mb-2"
        style={{ fontFamily: "'Fraunces', Georgia, serif", color: 'var(--text-primary)' }}
      >
        Phase 2 — Beyond Mobile
      </h3>
      <p
        className="max-w-[700px] mx-auto mb-5"
        style={{ color: 'var(--text-muted)' }}
      >
        The same methodology expands to Database Engineering, Backend, API Design, System Design,
        Distributed Systems, Cloud, DevOps, CI/CD, Software Architecture, Design Patterns, Security,
        and Scalability — building the definitive Software Engineering Knowledge Hub.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  )
}
