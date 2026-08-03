import type { Category } from '@/types/framework'

export const CATEGORIES: Category[] = [
  { id: 'core-architecture', title: 'Core Architecture', range: [1, 6] },
  { id: 'design-architecture', title: 'Design & Architecture', range: [7, 12] },
  { id: 'dev-ops', title: 'Development & Operations', range: [13, 18] },
  { id: 'intelligence', title: 'Intelligence & Judgment', range: [19, 24] },
]

export function getCategoryForSection(sectionNum: number): Category | undefined {
  return CATEGORIES.find(c => sectionNum >= c.range[0] && sectionNum <= c.range[1])
}
