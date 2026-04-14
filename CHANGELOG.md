# Changelog

## 1.0.0

### Breaking Changes

- **Renamed package** from `vuepress-api-playground` to `vue-api-playground`
- **Vue 3 only** — dropped Vue 2 support
- **New import path** — use `import { Playground } from 'vue-api-playground'`
- **Styles import** — use `import 'vue-api-playground/styles'`
- **Prop renamed** — `showURL` → `showUrl`

### Features

- Vue 3 Composition API with `<script setup lang="ts">`
- TypeScript support with exported types (`PlaygroundProps`, `PlaygroundDataItem`)
- Plug-and-play CSS theming — auto-inherits VitePress or custom theme colors
- Customizable via `--vap-*` CSS custom properties
- Response time display (ms)
- Collapsible response headers
- Copy response to clipboard
- Loading spinner animation
- Accessible ARIA labels on all interactive elements
- Request cancellation via AbortController
- Graceful handling of non-JSON responses (text fallback)
- PATCH method support (previously commented out)

### Infrastructure

- Migrated from Vue CLI (webpack) to Vite library mode
- Migrated docs from VuePress 1.x to VitePress
- ESLint 9 flat config with typescript-eslint
- Prettier (single quotes, no semicolons)
- Vitest test suite (18 tests)
- release-it with conventional changelog
- CI pipeline: typecheck, lint, format, test, build
- GitHub Pages deployment via official actions
