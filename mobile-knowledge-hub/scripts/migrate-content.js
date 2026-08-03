/**
 * Content Migration Script
 *
 * Reads the original index.html prototype and converts all 7 frameworks × 24 sections
 * into individual MDX files under src/content/{frameworkId}/{nn}-slug.mdx
 *
 * Usage: node scripts/migrate-content.js
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const HTML_PATH = path.resolve(ROOT, '..', 'index.html')
const CONTENT_DIR = path.resolve(ROOT, 'src', 'content')

// ── Section titles ────────────────────────────────────────────────
const SECTION_TITLES = {
  1: 'Overview & Introduction',
  2: 'Internal Architecture',
  3: 'Rendering Pipeline',
  4: 'Compilation Process',
  5: 'Project Structure',
  6: 'State Management',
  7: 'Architecture Patterns',
  8: 'Navigation',
  9: 'Networking',
  10: 'Local Database',
  11: 'Dependency Injection',
  12: 'Native Integration',
  13: 'Package System',
  14: 'Performance',
  15: 'Debugging',
  16: 'Testing',
  17: 'CI/CD',
  18: 'Security',
  19: 'AI Development',
  20: 'Best Practices',
  21: 'Common Mistakes',
  22: 'Decision Matrix',
  23: 'Comparisons',
  24: 'Real Project Example',
}

// ── Helpers ───────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function filename(sectionNum, title) {
  const nn = String(sectionNum).padStart(2, '0')
  return `${nn}-${slugify(title)}.mdx`
}

/**
 * Convert HTML content string to MDX-compatible markdown
 */
function htmlToMdx(html) {
  let result = html

  // ── Step 1: Convert leaf-level stat items FIRST ──
  result = result.replace(
    /<div class="s-stat">\s*<span class="s-stat-v">([^<]*)<\/span>\s*<span class="s-stat-l">([^<]*)<\/span>\s*<\/div>/g,
    '<StatItem value="$1" label="$2" />'
  )

  // ── Step 2: Convert stat grids (now items are flat, no nested divs) ──
  result = result.replace(
    /<div class="s-grid s-grid-3">\s*([\s\S]*?)\s*<\/div>/g,
    (_, inner) => `<StatGrid columns={3}>\n${inner.trim()}\n</StatGrid>`
  )
  result = result.replace(
    /<div class="s-grid">\s*([\s\S]*?)\s*<\/div>/g,
    (_, inner) => `<StatGrid>\n${inner.trim()}\n</StatGrid>`
  )

  // ── Code blocks → fenced code blocks (native MDX, avoids {} expression issues) ──
  result = result.replace(
    /<div class="code-block">\s*<pre><code>([\s\S]*?)<\/code><\/pre>\s*<\/div>/g,
    (_, code) => {
      const unescaped = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
      // Detect language
      let lang = ''
      if (unescaped.includes('fun ') || (unescaped.includes('class ') && unescaped.includes('val '))) lang = 'kotlin'
      else if (unescaped.includes('func ') || unescaped.includes('struct ') || unescaped.includes('Swift')) lang = 'swift'
      else if (unescaped.includes('Widget') || unescaped.includes('build()')) lang = 'dart'
      else if (unescaped.includes('export ') || unescaped.includes('import {')) lang = 'typescript'
      else if (unescaped.match(/^\/\//)) lang = 'javascript'
      else if (unescaped.includes('<!--') || unescaped.includes('xmlns:')) lang = 'xml'
      else if (unescaped.includes('gradle') || unescaped.includes('settings')) lang = 'kotlin'
      else if (unescaped.includes('yaml') || unescaped.includes('pubspec')) lang = 'yaml'
      else if (unescaped.includes('npm ') || unescaped.includes('node ')) lang = 'bash'
      return '```' + (lang || '') + '\n' + unescaped.trim() + '\n```'
    }
  )

  // ── Info callouts ──
  result = result.replace(
    /<div class="info-callout">\s*<p><strong>([^<]+)<\/strong>([\s\S]*?)<\/p>\s*<\/div>/g,
    '<Callout title="$1">\n$2\n</Callout>'
  )
  result = result.replace(
    /<div class="info-callout">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/g,
    '<Callout>\n$1\n</Callout>'
  )

  // ── Headings ──
  result = result.replace(/<h3>/g, '\n### ')
  result = result.replace(/<\/h3>/g, '\n')

  // ── Paragraphs ──
  result = result.replace(/<p>/g, '\n')
  result = result.replace(/<\/p>/g, '\n')

  // ── Lists ──
  result = result.replace(/<ul>/g, '\n')
  result = result.replace(/<\/ul>/g, '\n')
  result = result.replace(/<li>/g, '- ')
  result = result.replace(/<\/li>/g, '\n')
  result = result.replace(/<ol>/g, '\n')
  result = result.replace(/<\/ol>/g, '\n')

  // ── Inline formatting ──
  result = result.replace(/<strong>/g, '**')
  result = result.replace(/<\/strong>/g, '**')
  result = result.replace(/<em>/g, '*')
  result = result.replace(/<\/em>/g, '*')
  result = result.replace(/<code>/g, '`')
  result = result.replace(/<\/code>/g, '`')

  // ── Links ──
  result = result.replace(/<a href="([^"]*)">([^<]*)<\/a>/g, '[$2]($1)')

  // ── Line breaks ──
  result = result.replace(/<br\s*\/?>/g, '\n')

  // ── HTML entities ──
  result = result.replace(/&mdash;/g, '—')
  result = result.replace(/&middot;/g, '·')
  result = result.replace(/&amp;/g, '&')
  result = result.replace(/&quot;/g, '"')
  result = result.replace(/&lt;/g, '<')
  result = result.replace(/&gt;/g, '>')

  // ── Cleanup ──
  // Remove remaining HTML tags (but NOT our MDX components)
  // First protect MDX components
  const mdxBlocks = []
  result = result.replace(/<(StatGrid|StatItem|CodeBlock|Callout|DecisionMatrix)[^>]*\/?>(?:[\s\S]*?<\/\1>)?/g, (m) => {
    mdxBlocks.push(m)
    return `MDX${mdxBlocks.length - 1}\x00`
  })
  // Now strip remaining HTML tags
  result = result.replace(/<[^>]+>/g, '')
  // Restore MDX components
  mdxBlocks.forEach((block, i) => {
    result = result.replace(`MDX${i}\x00`, block)
  })
  // Collapse blank lines
  result = result.replace(/\n{3,}/g, '\n\n')

  // ── Escape MDX expressions ──
  // Protect: fenced blocks, JSX components, and Markdown link syntax
  const protected_ = []
  function protect(regex) {
    result = result.replace(regex, (match) => {
      protected_.push(match)
      return `\x00PROT${protected_.length - 1}\x00`
    })
  }

  // Order matters: protect from most specific to least
  protect(/```[\s\S]*?```/g)                          // Fenced code blocks
  protect(/<StatGrid[^>]*>[\s\S]*?<\/StatGrid>/g)     // StatGrid components
  protect(/<StatItem[^>]*?\/>/g)                       // StatItem self-closing
  protect(/<Callout[^>]*>[\s\S]*?<\/Callout>/g)       // Callout components
  protect(/<DecisionMatrix[^>]*?\/>/g)                 // DecisionMatrix self-closing
  protect(/\[([^\]]*)\]\(([^)]*)\)/g)                  // Markdown links [text](url)
  protect(/`[^`]+`/g)                                  // Inline code spans

  // Escape special MDX characters in remaining text
  result = result.replace(/\{/g, '\\{')
  result = result.replace(/\}/g, '\\}')
  result = result.replace(/</g, '&lt;')
  result = result.replace(/>/g, '&gt;')

  // Restore protected blocks (reverse order)
  protected_.forEach((block, i) => {
    result = result.replace(`\x00PROT${i}\x00`, block)
  })

  return result
}

// ── Main ──────────────────────────────────────────────────────────

console.log('Reading index.html...')
const html = fs.readFileSync(HTML_PATH, 'utf-8')

// Extract the script tag content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/)
if (!scriptMatch) {
  console.error('Could not find <script> tag in index.html')
  process.exit(1)
}

const scriptContent = scriptMatch[1]

console.log('Parsing framework definitions...')

// Parse each defineFramework({...}) call using brace counting
// The pattern is: defineFramework({ id: '...', name: '...', ..., sections: [...] })
const frameworks = []
const defineRegex = /defineFramework\(\{/g
let match
const starts = []
while ((match = defineRegex.exec(scriptContent)) !== null) {
  starts.push(match.index + 'defineFramework('.length)
}

// For each start position, find the matching closing brace
for (const startPos of starts) {
  let depth = 0
  let i = startPos
  let inString = false
  let stringChar = ''
  let inTemplate = false

  while (i < scriptContent.length) {
    const ch = scriptContent[i]
    const prev = i > 0 ? scriptContent[i - 1] : ''

    if (inTemplate) {
      if (ch === '`' && prev !== '\\') inTemplate = false
    } else if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false
    } else if (ch === '`') {
      inTemplate = true
    } else if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
    } else if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) {
        const objStr = scriptContent.slice(startPos, i + 1)
        try {
          // Evaluate just this object literal
          const obj = eval(`(${objStr})`)
          frameworks.push(obj)
        } catch (err) {
          console.error(`Failed to parse framework at position ${startPos}:`, err.message)
        }
        break
      }
    }
    i++
  }
}

console.log(`Found ${frameworks.length} frameworks:`)
frameworks.forEach(fw => console.log(`  - ${fw.name}: ${fw.sections.length} sections`))

// Create content directories and write MDX files
let totalFiles = 0

for (const fw of frameworks) {
  const fwDir = path.join(CONTENT_DIR, fw.id)
  fs.mkdirSync(fwDir, { recursive: true })

  fw.sections.forEach((section, i) => {
    const sectionNum = i + 1
    const mdxContent = htmlToMdx(section.content)

    const mdxFile = `import { StatGrid, StatItem, Callout, DecisionMatrix } from '@/components/mdx'

${mdxContent}
`

    const fname = filename(sectionNum, section.title)
    fs.writeFileSync(path.join(fwDir, fname), mdxFile, 'utf-8')
    totalFiles++
  })
}

console.log(`\n✅ Migrated ${totalFiles} MDX files to src/content/`)
console.log('Done!')
