# Contributing to LightBite RN Docs

## File conventions

- **Plain `.md` files** — no MDX, no JSON content
- **Kebab-case filenames** — `api-networking.md`, not `API_Networking.md`
- **No frontmatter** on section docs (`guide/`, `technical/`, `components/`) — start directly with `# Title`
- **One concept per file** — if you need "and" in the title, split it

## Page structure

1. `# Title` (H1) — no frontmatter
2. Short intro paragraph explaining what this page covers
3. `## Sections` (H2) for major topics
4. `### Subsections` (H3) for details
5. Markdown tables for specs, props, or comparisons
6. Fenced code blocks with language tag: ` ```tsx `, ` ```ts `, ` ```bash `
7. `## Next Steps` section linking to related docs with relative `./` links

## Adding a new page

1. Create the `.md` file in the appropriate directory
2. Register it in `.vitepress/config.ts` — add to the relevant sidebar group
3. Link to it from relevant existing pages

## Style

- **Bold key concepts** on first mention
- Use `\`inline code\`` for identifiers, file paths, and code references
- Use **Markdown tables** for catalogs and comparisons
- Keep docs concise — 25-180 lines is the sweet spot
- Show concrete code examples, not just descriptions
