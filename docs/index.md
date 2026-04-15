---
layout: home
title: Vue API Playground
titleTemplate: ':title · Interactive API playground for Vue 3'
description: Drop-in Vue 3 component for runnable API examples. Plug-and-play with VitePress or any Vue 3 app — zero dependencies, inherits your theme.

hero:
  name: Vue API Playground
  text: Ship runnable APIs in your docs.
  tagline: A drop-in Vue 3 component that turns any endpoint into a live, themeable playground. Zero runtime dependencies. ~8 KB JS gzipped.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: Examples
      link: /examples/

features:
  - title: Plug & play theming
    details: CSS custom properties cascade from VitePress or any Vue 3 design system. No config, no overrides — it just fits in.
  - title: Full HTTP support
    details: GET, POST, PUT, PATCH, DELETE with URL path parameters, query strings, JSON body, and editable headers.
  - title: Zero runtime dependencies
    details: Pure Vue 3 Composition API, native fetch, AbortController, clipboard. Fully typed. Tested with Vitest.
---

## Install

```bash
npm install vue-api-playground
```

## Register once

```ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { Playground } from 'vue-api-playground'
import 'vue-api-playground/styles'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueApiPlayground', Playground)
  },
}
```

## Drop it anywhere

```vue
<VueApiPlayground
  url="https://api.example.com/posts/{id}"
  method="get"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

## Why

Traditional API docs are static. Readers leave the page to test anything — Postman, curl, a scratch file. **Vue API Playground** collapses that loop: readers execute requests, edit parameters, and inspect responses without leaving your documentation.

It's the successor to [`vuepress-api-playground`](https://www.npmjs.com/package/vuepress-api-playground), rebuilt for Vue 3 and modern VitePress sites.

<nav class="vp-doc" aria-label="Project resources" style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:2rem;font-size:0.9rem;color:var(--vp-c-text-2)">
  <span>MIT licensed</span>
  <span aria-hidden="true">·</span>
  <span>TypeScript-first</span>
  <span aria-hidden="true">·</span>
  <span>Works with any Vue 3 app</span>
  <span aria-hidden="true">·</span>
  <a href="https://github.com/rodindev/vue-api-playground">GitHub</a>
  <span aria-hidden="true">·</span>
  <a href="https://www.npmjs.com/package/vue-api-playground">npm</a>
</nav>
