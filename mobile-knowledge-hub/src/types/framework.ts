export interface FrameworkConfig {
  id: string
  name: string
  icon: string
  color: string
  company: string
  language: string
  year: string
  tagline: string
  description: string
}

export interface Category {
  id: string
  title: string
  range: [number, number]
}

export interface SectionMeta {
  section: number
  title: string
  category: string
}

export interface SectionContent {
  meta: SectionMeta
  Component: React.ComponentType | null
}

export type ThemeMode = 'dark' | 'light'
