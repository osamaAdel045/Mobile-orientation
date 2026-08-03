import type { SectionContent } from '@/types/framework'
import { getSectionTitle } from './frameworks'
import { getCategoryForSection } from './categories'

/**
 * Lazy-load all MDX sections using Vite's import.meta.glob.
 * Returns a map of frameworkId → sectionNumber → { Component, meta }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdxModules = import.meta.glob('/src/content/**/*.mdx', { eager: true }) as Record<
  string,
  { default: React.ComponentType; frontmatter?: Record<string, unknown> }
>

// Build lookup: frameworkId → sectionNumber → SectionContent
const sectionMap = new Map<string, Map<number, SectionContent>>()

for (const [path, mod] of Object.entries(mdxModules)) {
  // Path format: /src/content/{frameworkId}/{nn}-slug.mdx
  const parts = path.split('/')
  const frameworkId = parts[3] // e.g., 'flutter'
  const fileName = parts[4] // e.g., '01-overview-introduction.mdx'

  if (!frameworkId || !fileName) continue

  const sectionNum = parseInt(fileName.match(/^(\d+)/)?.[1] || '0', 10)
  if (!sectionNum) continue

  const title = getSectionTitle(sectionNum)
  const category = getCategoryForSection(sectionNum)?.title || ''

  if (!sectionMap.has(frameworkId)) {
    sectionMap.set(frameworkId, new Map())
  }
  sectionMap.get(frameworkId)!.set(sectionNum, {
    meta: { section: sectionNum, title, category },
    Component: mod.default,
  })
}

export function getSection(frameworkId: string, sectionNum: number): SectionContent | null {
  return sectionMap.get(frameworkId)?.get(sectionNum) || null
}

export function getAllSections(frameworkId: string): SectionContent[] {
  const fwSections = sectionMap.get(frameworkId)
  if (!fwSections) return []
  return Array.from(fwSections.values()).sort((a, b) => a.meta.section - b.meta.section)
}

export function getFrameworkIds(): string[] {
  return Array.from(sectionMap.keys())
}

/**
 * Extract searchable text from an MDX module (basic: uses the filename and frontmatter)
 */
export function getSectionSearchText(frameworkId: string, sectionNum: number): string {
  const section = getSection(frameworkId, sectionNum)
  if (!section) return ''
  return `${frameworkId} ${section.meta.title} ${section.meta.category}`
}
