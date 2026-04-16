---
description: Props, URL path parameters, and request behavior for Vue API Playground.
---

# Usage

## Basic Example

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

The `{id}` in the URL is automatically replaced with the value from the `data` array.

## URL Path Parameters

Both `{param}` and `<param>` syntax are supported:

```vue
<VueApiPlayground
  url="https://api.example.com/users/{userId}/posts/<postId>"
  method="get"
  :data="[
    { name: 'userId', value: '1' },
    { name: 'postId', value: '5' },
  ]"
/>
```

Path parameters are consumed from the data — remaining fields become query parameters (GET) or JSON body (POST/PUT/PATCH).

## Props

| Prop             | Type                     | Required | Default            | Description                                                                                                                          |
| ---------------- | ------------------------ | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `url`            | `string`                 | yes      | —                  | API endpoint URL. Supports `{param}` and `<param>` path parameters                                                                   |
| `method`         | `string`                 | yes      | —                  | HTTP method: `get`, `post`, `put`, `patch`, `delete`                                                                                 |
| `data`           | `PlaygroundDataItem[]`   | no       | `[]`               | Input fields for the request                                                                                                         |
| `headers`        | `Record<string, string>` | no       | —                  | Custom HTTP headers (editable in the UI)                                                                                             |
| `showMethod`     | `boolean`                | no       | `false`            | Show HTTP method badge                                                                                                               |
| `showUrl`        | `boolean`                | no       | `false`            | Show the URL above the form                                                                                                          |
| `headingTag`     | `string`                 | no       | `'h4'`             | HTML tag for section headings                                                                                                        |
| `servers`        | `string[]`               | no       | —                  | Server URLs. When more than one, a selector is rendered                                                                              |
| `contentType`    | `PlaygroundContentType`  | no       | —                  | Body serialization: `application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`, `application/xml`  |
| `body`           | `string`                 | no       | —                  | Preset request body. Active when `contentType` is `application/json`, `text/plain`, or `application/xml`. User edits take precedence |
| `v-model:auth`   | `AuthConfig`             | no       | `{ type: 'none' }` | Declarative auth. See below                                                                                                          |
| `v-model:server` | `string`                 | no       | first of `servers` | Currently selected base URL                                                                                                          |

## Auth

```ts
type AuthConfig =
  | { type: 'none' }
  | { type: 'bearer'; token?: string }
  | { type: 'basic'; username?: string; password?: string }
  | { type: 'apiKey'; in: 'header' | 'query'; name: string; value?: string }
```

- `bearer` → `Authorization: Bearer <token>`
- `basic` → `Authorization: Basic base64(username:password)`
- `apiKey` with `in: 'header'` → `<name>: <value>` header
- `apiKey` with `in: 'query'` → `?<name>=<value>` appended to the URL

Empty values are skipped; no header or query param is attached when the field is blank.

## Events

| Event             | Payload                                 | Description                    |
| ----------------- | --------------------------------------- | ------------------------------ |
| `before-send`     | `{ url, init }`                         | Mutate envelope before fetch   |
| `request-start`   | `{ url, method, headers, body }`        | Fires just before `fetch()`    |
| `request-success` | `{ status, headers, body, durationMs }` | Fires on successful response   |
| `request-error`   | `{ error, durationMs }`                 | Fires on network / abort error |

### PlaygroundDataItem

```ts
interface PlaygroundDataItem {
  name: string // field name (used as key in request)
  value: string // default value
  type?: string // input type: 'text', 'number', etc.
}
```

## Request Behavior

| Method                 | Data handling                                                                  |
| ---------------------- | ------------------------------------------------------------------------------ |
| `GET`, `DELETE`        | Remaining fields appended as query string                                      |
| `POST`, `PUT`, `PATCH` | Remaining fields serialized as JSON body with `Content-Type: application/json` |

Custom `headers` override the default `Content-Type` header for body requests.

## Individual Components

v2 exports each component individually for custom layouts.

### ApiRequest

A standalone request form with execute button.

```vue
<script setup>
import { ApiRequest } from 'vue-api-playground'
import { ref } from 'vue'

const loading = ref(false)

function onExecute(request) {
  loading.value = true
  fetch(request.url, request.init)
    .then(/* handle response */)
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <ApiRequest
    url="https://api.example.com/posts"
    method="post"
    :data="[{ name: 'title', value: 'Hello' }]"
    :loading="loading"
    show-method
    @execute="onExecute"
  />
</template>
```

| Prop         | Type                     | Default | Description                        |
| ------------ | ------------------------ | ------- | ---------------------------------- |
| `url`        | `string`                 | —       | API endpoint URL                   |
| `method`     | `string`                 | —       | HTTP method                        |
| `data`       | `PlaygroundDataItem[]`   | `[]`    | Input fields                       |
| `headers`    | `Record<string, string>` | —       | Custom headers                     |
| `loading`    | `boolean`                | `false` | Shows spinner and disables execute |
| `showMethod` | `boolean`                | `false` | Show method badge                  |
| `headingTag` | `string`                 | `'h4'`  | HTML tag for section headings      |

Emits `@execute` with `{ url: string, init: RequestInit }`.

Supports **Ctrl+Enter** (Cmd+Enter on Mac) to execute from any input.

Includes a collapsible **Paste cURL** section for importing cURL commands.

### ApiResponse

A standalone response display with copy and cURL export.

```vue
<script setup>
import { ApiResponse } from 'vue-api-playground'
</script>

<template>
  <ApiResponse
    :status="200"
    :time="142"
    :headers="{ 'content-type': 'application/json' }"
    :body="{ id: 1, title: 'Hello World' }"
    :request="{ url: 'https://api.example.com/posts', method: 'GET' }"
  />
</template>
```

| Prop      | Type                             | Default | Description                            |
| --------- | -------------------------------- | ------- | -------------------------------------- |
| `status`  | `number \| null`                 | —       | HTTP status code                       |
| `time`    | `number \| null`                 | —       | Response time in ms                    |
| `headers` | `Record<string, string> \| null` | —       | Response headers                       |
| `body`    | `unknown`                        | —       | Response body (JSON object or string)  |
| `request` | `ApiResponseRequest`             | —       | Original request (enables cURL button) |

When `body` is `null`, the component renders nothing. When `request` is omitted, the cURL button is hidden.

Shows response payload size (e.g., "2.3 KB") and JSON syntax highlighting for JSON responses.

### MethodBadge

A colored HTTP method badge.

```vue
<script setup>
import { MethodBadge } from 'vue-api-playground'
</script>

<template>
  <MethodBadge method="post" />
</template>
```

Colors: GET = info (brand), POST = success (green), PUT/PATCH = warning (yellow), DELETE = danger (red).

## Utility Functions

### toCurl

Generate a cURL command from request parameters.

```ts
import { toCurl } from 'vue-api-playground'

const curl = toCurl({
  url: 'https://api.example.com/posts',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"title":"Hello"}',
})
// curl -X POST -H 'Content-Type: application/json' -d '{"title":"Hello"}' 'https://api.example.com/posts'
```

### parseCurl

Parse a cURL command into structured request data.

```ts
import { parseCurl } from 'vue-api-playground'

const result = parseCurl(
  'curl -X POST -H \'Content-Type: application/json\' -d \'{"title":"Hello"}\' https://api.example.com/posts'
)
// { url: '...', method: 'POST', headers: {...}, body: '...', ignoredFlags: [] }
```

Returns `null` for unparseable input. Unsupported flags are listed in `ignoredFlags`.
