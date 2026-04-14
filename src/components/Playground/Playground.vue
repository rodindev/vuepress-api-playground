<template>
  <div class="vap-playground">
    <component v-if="showMethod" :is="headingTag" class="vap-playground__method">
      Method:
      <span class="vap-badge" :class="`vap-badge--${methodColor}`">
        {{ method.toUpperCase() }}
      </span>
    </component>

    <component v-if="showUrl" :is="headingTag" class="vap-playground__url">
      URL: <code>{{ url }}</code>
    </component>

    <div v-if="visibleHeaders">
      <component :is="headingTag">Headers:</component>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in Object.keys(visibleHeaders)" :key="`header-${key}`">
            <td>{{ key }}</td>
            <td>
              <input
                v-model="editableHeaders[key]"
                type="text"
                :aria-label="`Header ${key}`"
                @keydown.enter="execute"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="inputData.length > 0">
      <component :is="headingTag">Data:</component>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in inputData" :key="`data-${index}`">
            <td>{{ item.name }}</td>
            <td>
              <input
                v-model="item.value"
                :type="item.type ?? 'text'"
                :aria-label="item.name"
                @keydown.enter="execute"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <button :disabled="loading" aria-label="Execute request" @click="execute">
      <span v-if="loading" class="vap-spinner" />
      {{ loading ? 'Loading' : 'Execute' }}
    </button>

    <div v-if="response.body !== null" class="vap-playground__response">
      <div class="vap-playground__response-bar">
        <span v-if="response.status !== null" class="vap-playground__status">
          Status:
          <span
            class="vap-badge"
            :class="response.status < 300 ? 'vap-badge--success' : 'vap-badge--danger'"
          >
            {{ response.status }}
          </span>
        </span>
        <span v-if="response.time !== null" class="vap-playground__time">
          {{ response.time }} ms
        </span>
        <button class="vap-playground__copy" aria-label="Copy response" @click="copyResponse">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <details v-if="response.headers" class="vap-playground__headers">
        <summary>Response Headers</summary>
        <pre class="vap-playground__code"><code>{{ formattedHeaders }}</code></pre>
      </details>

      <pre class="vap-playground__code"><code>{{ formattedResponse }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import type { PlaygroundDataItem, PlaygroundProps } from './types'

const props = withDefaults(defineProps<PlaygroundProps>(), {
  data: () => [],
  headers: undefined,
  showMethod: false,
  showUrl: false,
  headingTag: 'h4',
})

const loading = ref(false)
const copied = ref(false)
const inputData = ref<PlaygroundDataItem[]>([])
const editableHeaders = reactive<Record<string, string>>({})
const response = reactive<{
  body: unknown
  status: number | null
  time: number | null
  headers: Record<string, string> | null
}>({
  body: null,
  status: null,
  time: null,
  headers: null,
})

let abortController: AbortController | null = null
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const methodColor = computed(() => {
  const colors: Record<string, string> = {
    get: 'info',
    post: 'success',
    put: 'warning',
    patch: 'warning',
    delete: 'danger',
  }
  return colors[props.method.toLowerCase()] ?? 'info'
})

const visibleHeaders = computed(() => {
  const h = props.headers
  return h && Object.keys(h).length > 0 ? h : null
})

const formattedResponse = computed(() => {
  if (response.body === null) return ''
  if (typeof response.body === 'string') return response.body
  return JSON.stringify(response.body, null, 2)
})

const formattedHeaders = computed(() => {
  if (!response.headers) return ''
  return Object.entries(response.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
})

onMounted(() => {
  inputData.value = (props.data ?? []).map((item) => ({ ...item }))

  if (props.headers) {
    Object.assign(editableHeaders, props.headers)
  }
})

onBeforeUnmount(() => {
  abortController?.abort()
  if (copyTimeout) clearTimeout(copyTimeout)
})

function buildRequestData(): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const item of inputData.value) {
    if (item.value === '') continue
    try {
      result[item.name] = JSON.parse(item.value)
    } catch {
      result[item.name] = item.value
    }
  }

  return result
}

function buildRequest(): { url: string; init: RequestInit } {
  const data = buildRequestData()
  let url = props.url
  const method = props.method.toLowerCase()

  // Replace URL path parameters: {id} or <id>
  const patterns = [/{([a-zA-Z_-]+)}/g, /<([a-zA-Z_-]+)>/g]
  for (const pattern of patterns) {
    url = url.replace(pattern, (match, key: string) => {
      const value = String(data[key] ?? match)
      delete data[key]
      return value
    })
  }

  const init: RequestInit = {
    method,
    signal: abortController?.signal,
  }

  const hasBody = ['post', 'put', 'patch'].includes(method)

  if (Object.keys(data).length > 0) {
    if (hasBody) {
      init.headers =
        Object.keys(editableHeaders).length > 0
          ? { ...editableHeaders }
          : { 'Content-Type': 'application/json' }
      init.body = JSON.stringify(data)
    } else {
      const params = new URLSearchParams(Object.entries(data).map(([k, v]) => [k, String(v)]))
      url = `${url}?${params}`
    }
  } else if (hasBody && Object.keys(editableHeaders).length > 0) {
    init.headers = { ...editableHeaders }
  }

  return { url, init }
}

async function execute() {
  abortController?.abort()
  abortController = new AbortController()

  response.body = null
  response.status = null
  response.time = null
  response.headers = null
  loading.value = true

  const start = performance.now()

  try {
    const { url, init } = buildRequest()
    const res = await fetch(url, init)

    response.status = res.status
    response.time = Math.round(performance.now() - start)

    // Capture response headers
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      headers[key] = value
    })
    response.headers = Object.keys(headers).length > 0 ? headers : null

    const text = await res.text()
    try {
      response.body = JSON.parse(text)
    } catch {
      response.body = text
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    response.time = Math.round(performance.now() - start)
    response.body = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
}

async function copyResponse() {
  try {
    await navigator.clipboard.writeText(formattedResponse.value)
    copied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard API not available
  }
}
</script>
