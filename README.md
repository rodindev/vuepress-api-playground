# Vue API Playground

[![npm version](https://img.shields.io/npm/v/vue-api-playground)](https://www.npmjs.com/package/vue-api-playground)
[![CI](https://github.com/rodindev/vuepress-api-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/rodindev/vuepress-api-playground/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/npm/l/vue-api-playground)](https://github.com/rodindev/vuepress-api-playground/blob/main/LICENSE)

Interactive API playground component for Vue 3. Plug-and-play with VitePress or any Vue 3 app — automatically inherits host theme styles.

> Successor to [`vuepress-api-playground`](https://www.npmjs.com/package/vuepress-api-playground).

## Features

- **Plug & play theming** — CSS custom properties cascade from VitePress or your own theme
- **All HTTP methods** — GET, POST, PUT, PATCH, DELETE with URL path parameters
- **Response time & headers** — performance metrics and collapsible response headers
- **Copy response** — one-click copy to clipboard
- **TypeScript** — fully typed props and exports
- **Lightweight** — zero runtime dependencies, ~3 KB gzipped

## Install

```bash
npm install vue-api-playground
```

## Quick Start

### VitePress

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

Then in any `.md` file:

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

### Vue 3 App

```ts
import { createApp } from 'vue'
import { Playground } from 'vue-api-playground'
import 'vue-api-playground/styles'

// Register globally
app.component('VueApiPlayground', Playground)

// Or import directly in a component
```

```vue
<script setup>
import { Playground } from 'vue-api-playground'
</script>

<template>
  <Playground
    url="https://jsonplaceholder.typicode.com/posts/{id}"
    method="get"
    :data="[{ name: 'id', value: '1', type: 'number' }]"
  />
</template>
```

## Props

| Prop         | Type                     | Default | Description                                                    |
| ------------ | ------------------------ | ------- | -------------------------------------------------------------- |
| `url`        | `string`                 | —       | API endpoint. Supports `{param}` and `<param>` path parameters |
| `method`     | `string`                 | —       | HTTP method: `get`, `post`, `put`, `patch`, `delete`           |
| `data`       | `PlaygroundDataItem[]`   | `[]`    | Input fields for the request                                   |
| `headers`    | `Record<string, string>` | —       | Custom HTTP headers (editable)                                 |
| `showMethod` | `boolean`                | `false` | Show method badge                                              |
| `showUrl`    | `boolean`                | `false` | Show URL                                                       |
| `headingTag` | `string`                 | `'h4'`  | HTML tag for section headings                                  |

## Custom Theming

Override `--vap-*` CSS variables to match your design:

```css
:root {
  --vap-brand: #6366f1;
  --vap-text: #1a1a1a;
  --vap-border: #e5e7eb;
  --vap-radius: 8px;
}
```

For dark mode, override under your dark class:

```css
.dark {
  --vap-text: #e5e7eb;
  --vap-bg: #1a1a2e;
  --vap-border: #334155;
  --vap-code-bg: #0f172a;
}
```

When no `--vap-*` variables are set, the component falls back to VitePress theme variables, then hardcoded defaults. See the [full variable reference](https://rodindev.github.io/vuepress-api-playground/guide/customization) for all 14 customizable properties.

You can also skip the default styles entirely and write your own — the component renders semantic HTML with `vap-` prefixed classes.

## Documentation

Full documentation with live examples: [rodindev.github.io/vuepress-api-playground](https://rodindev.github.io/vuepress-api-playground/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
