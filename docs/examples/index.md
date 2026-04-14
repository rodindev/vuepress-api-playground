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
