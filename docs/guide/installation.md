---
description: How to install and set up Vue API Playground in VitePress or any Vue 3 app.
---

# Installation

## Install

```bash
npm install vue-api-playground
```

## VitePress

Register the component and import styles in your custom theme:

```ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { Playground } from 'vue-api-playground'
import 'vue-api-playground/styles'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueApiPlayground', Playground)
  },
} satisfies Theme
```

That's it — the component automatically inherits VitePress theme colors, including dark mode.

## Any Vue 3 App

### As a plugin

Registers `<VueApiPlayground>` globally:

```ts
import { createApp } from 'vue'
import VueApiPlayground from 'vue-api-playground'
import 'vue-api-playground/styles'

const app = createApp(App)
app.use(VueApiPlayground)
```

### As a local component

```vue
<script setup>
import { Playground } from 'vue-api-playground'
import 'vue-api-playground/styles'
</script>

<template>
  <Playground
    url="https://api.example.com/posts/{id}"
    method="get"
    :data="[{ name: 'id', value: '1', type: 'number' }]"
  />
</template>
```

### Without default styles

You can skip the default styles and write your own. The component renders semantic HTML with `vap-` prefixed classes:

```ts
import { Playground } from 'vue-api-playground'
// Don't import 'vue-api-playground/styles'
// Style .vap-playground, .vap-badge, etc. yourself
```

See the [Customization](./customization) page for the full CSS class reference and all 14 CSS variables.

## Migrating from vuepress-api-playground

1. Replace the package:

   ```bash
   npm uninstall vuepress-api-playground
   npm install vue-api-playground
   ```

2. Update imports:

   ```diff
   - import VuepressApiPlayground from 'vuepress-api-playground'
   - import 'vuepress-api-playground/styles/index.scss'
   + import { Playground } from 'vue-api-playground'
   + import 'vue-api-playground/styles'
   ```

3. The component name in templates changes from `VuepressApiPlayground` to `VueApiPlayground` (when registered via the plugin), or use the name you choose when registering manually.

4. The `showURL` prop is renamed to `showUrl` for consistency.
