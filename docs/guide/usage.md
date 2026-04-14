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

| Prop         | Type                     | Required | Default | Description                                                        |
| ------------ | ------------------------ | -------- | ------- | ------------------------------------------------------------------ |
| `url`        | `string`                 | yes      | —       | API endpoint URL. Supports `{param}` and `<param>` path parameters |
| `method`     | `string`                 | yes      | —       | HTTP method: `get`, `post`, `put`, `patch`, `delete`               |
| `data`       | `PlaygroundDataItem[]`   | no       | `[]`    | Input fields for the request                                       |
| `headers`    | `Record<string, string>` | no       | —       | Custom HTTP headers (editable in the UI)                           |
| `showMethod` | `boolean`                | no       | `false` | Show HTTP method badge                                             |
| `showUrl`    | `boolean`                | no       | `false` | Show the URL above the form                                        |
| `headingTag` | `string`                 | no       | `'h4'`  | HTML tag for section headings                                      |

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
