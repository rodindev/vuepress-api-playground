# Contributing

Thanks for your interest in contributing to Vue API Playground!

## Development Setup

```bash
git clone https://github.com/rodindev/vuepress-api-playground.git
cd vuepress-api-playground
npm install
```

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start VitePress docs dev server |
| `npm run build`     | Build library (ESM + CJS)       |
| `npm run typecheck` | Run TypeScript type checking    |
| `npm run lint`      | Lint and auto-fix with ESLint   |
| `npm run format`    | Format with Prettier            |
| `npm run test`      | Run tests in watch mode         |
| `npm run test:run`  | Run tests once                  |

## Before Submitting a PR

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
```

All checks must pass. CI runs these automatically on every PR.

## Code Style

- TypeScript strict mode — no `any`
- Single quotes, no semicolons (Prettier)
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, etc.

## Project Structure

```
src/
  index.ts                 # Library entry point
  components/
    Playground/
      Playground.vue       # Main component
      Playground.spec.ts   # Tests
      types.ts             # TypeScript types
  styles/
    index.scss             # Plug & play styles with CSS variable cascade
docs/                      # VitePress documentation
```
