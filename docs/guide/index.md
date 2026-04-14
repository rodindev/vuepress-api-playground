---
description: Interactive API playground component for Vue 3. Plug-and-play with VitePress or any Vue 3 app.
---

# Introduction

**Vue API Playground** is an interactive Vue 3 component for showcasing and testing API endpoints directly in your documentation or application.

Drop it into VitePress or any Vue 3 app — it automatically picks up your theme's colors and styles with zero configuration.

## Try it

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :show-method="true"
  :show-url="true"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>

::: info Migrating from vuepress-api-playground?
This package is the successor to [`vuepress-api-playground`](https://www.npmjs.com/package/vuepress-api-playground). See the [installation guide](./installation) for migration steps.
:::

## Features

- **Plug & play theming** — uses CSS custom properties that cascade from VitePress or your own theme
- **All HTTP methods** — GET, POST, PUT, PATCH, DELETE
- **URL path parameters** — `{id}` and `<id>` syntax with automatic substitution
- **Query parameters** — auto-appended for GET requests
- **JSON body** — auto-serialized for POST/PUT/PATCH
- **Custom headers** — editable header fields
- **Response time** — shows request duration in milliseconds
- **Response headers** — collapsible section with full response headers
- **Copy response** — one-click copy to clipboard
- **Request cancellation** — AbortController-based, prevents stale responses
- **Accessibility** — ARIA labels on all interactive elements
- **TypeScript** — fully typed props and exports
- **Lightweight** — zero runtime dependencies, ~3 KB gzipped
