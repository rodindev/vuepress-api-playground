---
description: Live interactive examples of Vue API Playground — GET, POST, PUT, PATCH, DELETE requests.
---

# Examples

All examples use the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API.

## GET Request

Fetch a post by ID using a path parameter:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

:::

## GET with Query Parameters

Fetch posts filtered by `userId`:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="get"
  :show-method="true"
  :data="[{ name: 'userId', value: '1', type: 'number' }]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="get"
  :show-method="true"
  :data="[{ name: 'userId', value: '1', type: 'number' }]"
/>
```

:::

## GET with URL Display

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :show-url="true"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="get"
  :show-url="true"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

:::

## POST Request

Create a new post:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  :show-method="true"
  :data="[
    { name: 'title', value: 'Hello World' },
    { name: 'body', value: 'This is a test post' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  :show-method="true"
  :data="[
    { name: 'title', value: 'Hello World' },
    { name: 'body', value: 'This is a test post' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>
```

:::

## POST with Custom Headers

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  :show-method="true"
  :headers="{ 'Content-Type': 'application/json' }"
  :data="[
    { name: 'title', value: 'Custom Headers' },
    { name: 'body', value: 'Post with custom headers' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  :show-method="true"
  :headers="{ 'Content-Type': 'application/json' }"
  :data="[
    { name: 'title', value: 'Custom Headers' },
    { name: 'body', value: 'Post with custom headers' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>
```

:::

## PUT Request

Update a post:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="put"
  :show-method="true"
  :data="[
    { name: 'id', value: '1', type: 'number' },
    { name: 'title', value: 'Updated Title' },
    { name: 'body', value: 'Updated body content' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="put"
  :show-method="true"
  :data="[
    { name: 'id', value: '1', type: 'number' },
    { name: 'title', value: 'Updated Title' },
    { name: 'body', value: 'Updated body content' },
    { name: 'userId', value: '1', type: 'number' },
  ]"
/>
```

:::

## PATCH Request

Partially update a post:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="patch"
  :show-method="true"
  :data="[
    { name: 'id', value: '1', type: 'number' },
    { name: 'title', value: 'Patched Title' },
  ]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="patch"
  :show-method="true"
  :data="[
    { name: 'id', value: '1', type: 'number' },
    { name: 'title', value: 'Patched Title' },
  ]"
/>
```

:::

## DELETE Request

Delete a post:

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="delete"
  :show-method="true"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/{id}"
  method="delete"
  :show-method="true"
  :data="[{ name: 'id', value: '1', type: 'number' }]"
/>
```

:::

## POST with Raw JSON Body

Preset the request body as a raw string. Editable in the UI; user edits take
precedence over subsequent external updates.

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  content-type="application/json"
  body='{"title":"Hello","body":"Preset body","userId":1}'
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts"
  method="post"
  content-type="application/json"
  body='{"title":"Hello","body":"Preset body","userId":1}'
/>
```

:::

## Bearer Auth

Declarative bearer token. The `Authorization: Bearer …` header is attached only
when the field is non-empty.

<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/1"
  method="get"
  :auth="{ type: 'bearer', token: 'demo-token' }"
/>

::: details Source

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/1"
  method="get"
  :auth="{ type: 'bearer', token: 'demo-token' }"
/>
```

:::

## Multiple Servers

When `servers` has more than one entry, a selector is rendered. Use
`v-model:server` to control which origin is selected.

<VueApiPlayground
  url="/posts/1"
  method="get"
  :servers="['https://jsonplaceholder.typicode.com', 'https://dummyjson.com']"
/>

::: details Source

```vue
<VueApiPlayground
  url="/posts/1"
  method="get"
  :servers="['https://jsonplaceholder.typicode.com', 'https://dummyjson.com']"
/>
```

:::

## Lifecycle Events

Observe request timing, status, and errors via `@request-start`,
`@request-success`, and `@request-error`:

```vue
<VueApiPlayground
  url="https://jsonplaceholder.typicode.com/posts/1"
  method="get"
  @request-start="(p) => console.log('[start]', p)"
  @request-success="(p) => console.log('[ok]', p.status, p.durationMs)"
  @request-error="(p) => console.warn('[err]', p.error, p.durationMs)"
/>
```
