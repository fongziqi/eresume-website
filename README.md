# Fong Zi Qi — Resume Website

A cyberpunk-themed personal resume and portfolio site. Single-page, dark-mode,
terminal-inspired, with a neon design system, glitch effects, and interactive
project detail modals.

**Live site:** https://eresume-website.vercel.app/

## Tech stack

- **React 18** + **TypeScript**
- **Vite** — dev server and build
- **Tailwind CSS v4** — styling, driven by CSS-variable design tokens
- **Motion** — scroll reveals, hover motion, modal transitions
- **Radix UI Dialog** — accessible project modals (focus trap, scroll lock, `Esc`)
- **lucide-react** — icons
- Fonts: **Orbitron** (display), **JetBrains Mono** (UI), **Share Tech Mono** (body)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
```

Requires Node.js 18+.

## Features

- **Cyberpunk design system** — neon palette (green / magenta / cyan / amber),
  chamfered corners, CRT scanlines, and an RGB-split glitch effect, all centralized
  as tokens in `src/styles/theme.css`.
- **Sections** — hero, about, skills, academic projects, vibe-coded projects,
  leadership & education, and contact.
- **Project modals** — click any project card to open a detail view with
  screenshots, why it was built, what was learned, and the tools used.
- **Color-coded tech chips** — each technology is tinted by category (language /
  framework / data / AI) so the stack reads at a glance.
- **Accessible** — keyboard-navigable, WCAG AA contrast, and respects
  `prefers-reduced-motion`.

## Project structure

```
src/
  app/
    App.tsx              # the entire site: data, components, sections
    components/ui/       # shadcn-style Radix primitives
  styles/
    theme.css            # design tokens, glitch, scanlines, chamfer utilities
    fonts.css            # Google Fonts imports
  main.tsx               # entry point
public/
  resume.pdf             # downloadable resume
  projects/              # project screenshots
```

## Notes

- Project content, screenshots, and copy live in the `ACADEMIC_PROJECTS` and
  `VIBE_PROJECTS` arrays at the top of `src/app/App.tsx` — edit there to update.
- Screenshots in `public/projects/` are redacted where they contained personal
  data; unredacted originals are kept out of version control.

---

Built with React + Tailwind.
