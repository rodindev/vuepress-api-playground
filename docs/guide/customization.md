---
description: CSS variables, class reference, dark mode, and custom styling for Vue API Playground.
---

# Customization

Vue API Playground is designed to work out of the box with VitePress. For standalone Vue 3 apps or custom setups, you have full control over the look and feel.

## CSS Variables

The component uses CSS custom properties with a `--vap-*` prefix. Override them at any scope — globally or per-instance.

### Full variable reference

| Variable           | Description                                    | Default       |
| ------------------ | ---------------------------------------------- | ------------- |
| `--vap-brand`      | Primary/accent color (buttons, focus rings)    | `#3eaf7c`     |
| `--vap-text`       | Main text color                                | `#2c3e50`     |
| `--vap-text-light` | Secondary text (response time, labels)         | `#476582`     |
| `--vap-border`     | Border color for tables, inputs, response area | `#eaecef`     |
| `--vap-bg`         | Background color for inputs                    | `#ffffff`     |
| `--vap-bg-soft`    | Soft background (table headers, status bar)    | `#f3f4f6`     |
| `--vap-code-bg`    | Code block background                          | `#1e1e1e`     |
| `--vap-code-text`  | Code block text color                          | `#d4d4d4`     |
| `--vap-success`    | Success badge color (2xx status)               | `#42b983`     |
| `--vap-danger`     | Error badge color (4xx/5xx status)             | `#cc0000`     |
| `--vap-warning`    | Warning badge color (PUT/PATCH method)         | `#e7c000`     |
| `--vap-info`       | Info badge color (GET method)                  | same as brand |
| `--vap-radius`     | Border radius for inputs, buttons, badges      | `6px`         |
| `--vap-font-size`  | Base font size                                 | `0.9rem`      |

### Global override

Apply to all playground instances:

```css
:root {
  --vap-brand: #6366f1;
  --vap-text: #1a1a1a;
  --vap-border: #e5e7eb;
  --vap-bg: #ffffff;
  --vap-bg-soft: #f9fafb;
  --vap-radius: 8px;
}
```

### Per-instance override

Scope variables to a specific wrapper:

```vue
<template>
  <div class="custom-playground">
    <VueApiPlayground url="https://api.example.com/posts" method="get" />
  </div>
</template>

<style>
.custom-playground {
  --vap-brand: #e11d48;
  --vap-radius: 12px;
  --vap-font-size: 0.85rem;
}
</style>
```

### Dark mode

For apps with a dark mode toggle, override the variables under your dark class or media query:

```css
:root {
  --vap-text: #1a1a1a;
  --vap-bg: #ffffff;
  --vap-bg-soft: #f3f4f6;
  --vap-border: #e5e7eb;
  --vap-code-bg: #1e1e1e;
  --vap-code-text: #d4d4d4;
}

.dark,
[data-theme='dark'] {
  --vap-text: #e5e7eb;
  --vap-bg: #1a1a2e;
  --vap-bg-soft: #16213e;
  --vap-border: #334155;
  --vap-code-bg: #0f172a;
  --vap-code-text: #e2e8f0;
}
```

::: tip
When used inside VitePress, the component automatically inherits dark mode colors from the theme. No extra configuration needed.
:::

## How the CSS cascade works

The component resolves each color through three fallback levels:

```
--vap-*  →  --vp-c-*  →  hardcoded default
(user)      (VitePress)    (standalone)
```

This means:

- **In VitePress** — component reads `--vp-c-brand-1`, `--vp-c-text-1`, etc. from the theme
- **Standalone** — hardcoded defaults kick in (green accent, dark text, light background)
- **`--vap-*` always wins** — if you set it, it overrides everything else

## Custom styles

If CSS variables aren't enough, you can target the component's CSS classes directly. All classes are prefixed with `vap-` to avoid collisions.

### Class reference

| Class                     | Element                        |
| ------------------------- | ------------------------------ |
| `.vap-playground`         | Playground root container      |
| `.vap-playground__method` | Playground method heading      |
| `.vap-playground__url`    | Playground URL heading         |
| `.vap-request`            | ApiRequest root container      |
| `.vap-request__method`    | ApiRequest method heading      |
| `.vap-request__import`    | cURL import `<details>`        |
| `.vap-response`           | ApiResponse root / wrapper     |
| `.vap-response__bar`      | Status + time + buttons bar    |
| `.vap-response__status`   | Status text + badge            |
| `.vap-response__time`     | Response time display          |
| `.vap-response__size`     | Response payload size          |
| `.vap-response__headers`  | Response headers `<details>`   |
| `.vap-table`              | Shared table (headers, data)   |
| `.vap-input`              | Shared input fields            |
| `.vap-btn`                | Button base class              |
| `.vap-btn--primary`       | Execute button                 |
| `.vap-btn--secondary`     | Copy / cURL buttons            |
| `.vap-code`               | Code/response `<pre>` block    |
| `.vap-badge`              | Badge base class               |
| `.vap-badge--success`     | 2xx status / POST badge        |
| `.vap-badge--danger`      | 4xx/5xx status / DELETE badge  |
| `.vap-badge--warning`     | PUT/PATCH method badge         |
| `.vap-badge--info`        | GET method badge               |
| `.vap-spinner`            | Loading spinner                |
| `.vap-json-key`           | JSON key in highlighted output |
| `.vap-json-string`        | JSON string value              |
| `.vap-json-number`        | JSON number value              |
| `.vap-json-bool`          | JSON boolean/null value        |

### Example: custom button style

```css
.vap-btn--primary {
  background-color: #6366f1;
  border-color: #6366f1;
  border-radius: 9999px;
  font-weight: 600;
}
```

## Without styles

You can skip the default styles entirely and write your own:

```ts
import { Playground } from 'vue-api-playground'
// Don't import 'vue-api-playground/styles'
```

The component renders semantic HTML with `vap-` prefixed classes. Style them however you want.
