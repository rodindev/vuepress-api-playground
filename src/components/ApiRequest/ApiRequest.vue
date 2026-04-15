<template>
  <div class="vap-request" @keydown="onKeydown">
    <details class="vap-request__import">
      <summary>Paste cURL</summary>
      <div class="vap-request__import-body">
        <textarea
          v-model="curlInput"
          class="vap-input vap-request__import-textarea"
          placeholder="curl -X POST -H 'Content-Type: application/json' -d '{...}' https://..."
          rows="3"
          aria-label="Paste cURL command"
        />
        <div v-if="curlError" class="vap-request__import-error">
          {{ curlError }}
        </div>
        <div v-if="curlWarning" class="vap-request__import-warning">
          {{ curlWarning }}
        </div>
        <button
          class="vap-btn vap-btn--secondary"
          aria-label="Apply cURL command"
          @click="applyCurl"
        >
          Apply
        </button>
      </div>
    </details>

    <component v-if="showMethod" :is="headingTag" class="vap-request__method">
      Method:
      <MethodBadge :method="method" />
    </component>

    <div v-if="servers && servers.length > 1" class="vap-request__server">
      <component :is="headingTag">Server:</component>
      <select v-model="selectedServer" class="vap-input" aria-label="Server">
        <option v-for="server in servers" :key="server" :value="server">
          {{ server }}
        </option>
      </select>
    </div>

    <div v-if="visibleHeaders">
      <component :is="headingTag">Headers:</component>
      <table class="vap-table">
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
                class="vap-input"
                :aria-label="`Header ${key}`"
                @keydown.enter.exact="emitExecute"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="inputData.length > 0">
      <component :is="headingTag">Data:</component>
      <table class="vap-table">
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
                v-if="item.type === 'file'"
                type="file"
                class="vap-input"
                :aria-label="item.name"
                @change="onFileChange($event, index)"
              />
              <input
                v-else
                v-model="inputValues[index]"
                :type="htmlInputType(item.type)"
                class="vap-input"
                :aria-label="item.name"
                @keydown.enter.exact="emitExecute"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <slot name="send-button" :loading="loading" :execute="emitExecute">
      <button
        class="vap-btn vap-btn--primary"
        :disabled="loading"
        aria-label="Execute request"
        @click="emitExecute"
      >
        <span v-if="loading" class="vap-spinner" />
        {{ loading ? 'Loading' : 'Execute' }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import type { PlaygroundContentType, PlaygroundDataItem } from '../Playground/types'
import type { ApiRequestProps } from './types'
import { parseCurl } from '../../utils/curl'
import MethodBadge from '../MethodBadge/MethodBadge.vue'

const props = withDefaults(defineProps<ApiRequestProps>(), {
  data: () => [],
  headers: undefined,
  loading: false,
  showMethod: false,
  headingTag: 'h4',
  servers: undefined,
  contentType: undefined,
})

const emit = defineEmits<{
  execute: [request: { url: string; init: RequestInit }]
}>()

defineSlots<{
  'send-button'(props: { loading: boolean; execute: () => void }): unknown
}>()

const inputData = ref<PlaygroundDataItem[]>([])
const inputValues = ref<string[]>([])
const editableHeaders = reactive<Record<string, string>>({})
const curlInput = ref('')
const curlError = ref('')
const curlWarning = ref('')
const selectedServer = ref<string>(props.servers?.[0] ?? '')

watch(
  () => props.servers,
  (newServers) => {
    if (!newServers || newServers.length === 0) {
      selectedServer.value = ''
      return
    }
    if (!newServers.includes(selectedServer.value)) {
      selectedServer.value = newServers[0]!
    }
  }
)

const visibleHeaders = computed(() => {
  const keys = Object.keys(editableHeaders)
  return keys.length > 0 ? editableHeaders : null
})

function syncFromProps(dataProp: PlaygroundDataItem[] | undefined) {
  const source = dataProp ?? []
  inputData.value = source.map((item) => ({ ...item }))
  inputValues.value = source.map((item) => (typeof item.value === 'string' ? item.value : ''))
}

onMounted(() => {
  syncFromProps(props.data)
  if (props.headers) {
    Object.assign(editableHeaders, props.headers)
  }
})

watch(
  () => props.data,
  (newData) => {
    syncFromProps(newData)
  }
)

watch(
  () => props.headers,
  (newHeaders) => {
    for (const key of Object.keys(editableHeaders)) {
      delete editableHeaders[key]
    }
    if (newHeaders) {
      Object.assign(editableHeaders, newHeaders)
    }
  }
)

function htmlInputType(type: string | undefined): string {
  const semantic = new Set(['path', 'query', 'header', 'file'])
  if (!type || semantic.has(type)) return 'text'
  return type
}

function onFileChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  const item = inputData.value[index]
  if (item && file) {
    item.value = file
  }
}

function currentValue(item: PlaygroundDataItem, index: number): string | File {
  if (item.type === 'file') {
    return item.value instanceof File ? item.value : ''
  }
  return inputValues.value[index] ?? ''
}

function buildBodyRecord(
  bodyItems: Array<{ item: PlaygroundDataItem; index: number }>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const { item, index } of bodyItems) {
    const raw = inputValues.value[index] ?? ''
    if (raw === '') continue
    try {
      result[item.name] = JSON.parse(raw)
    } catch {
      result[item.name] = raw
    }
  }
  return result
}

function findHeaderKey(headers: Record<string, string>, name: string): string | null {
  const lower = name.toLowerCase()
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return key
  }
  return null
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function emitExecute() {
  if (props.loading) return

  const pathItems: Array<{ item: PlaygroundDataItem; index: number }> = []
  const queryItems: Array<{ item: PlaygroundDataItem; index: number }> = []
  const headerItems: Array<{ item: PlaygroundDataItem; index: number }> = []
  const fileItems: Array<{ item: PlaygroundDataItem; index: number }> = []
  const bodyItems: Array<{ item: PlaygroundDataItem; index: number }> = []

  inputData.value.forEach((item, index) => {
    switch (item.type) {
      case 'path':
        pathItems.push({ item, index })
        break
      case 'query':
        queryItems.push({ item, index })
        break
      case 'header':
        headerItems.push({ item, index })
        break
      case 'file':
        fileItems.push({ item, index })
        break
      default:
        bodyItems.push({ item, index })
    }
  })

  const data = buildBodyRecord(bodyItems)
  const method = props.method.toLowerCase()
  let url = (selectedServer.value || '') + props.url

  for (const { item, index } of pathItems) {
    const raw = currentValue(item, index)
    const val = raw instanceof File ? raw.name : String(raw ?? '')
    const encoded = encodeURIComponent(val)
    const regex = new RegExp(`\\{${escapeRegex(item.name)}\\}|<${escapeRegex(item.name)}>`, 'g')
    url = url.replace(regex, encoded)
  }

  const patterns = [/{([a-zA-Z_-]+)}/g, /<([a-zA-Z_-]+)>/g]
  for (const pattern of patterns) {
    url = url.replace(pattern, (match, key: string) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const encoded = encodeURIComponent(String(data[key]))
        delete data[key]
        return encoded
      }
      return match
    })
  }

  const leftover = url.match(/\{[a-zA-Z_-]+\}|<[a-zA-Z_-]+>/g)
  if (leftover && leftover.length > 0) {
    console.warn('[vap] Unsubstituted path parameters: ' + leftover.join(', '))
  }

  const baseHeaders: Record<string, string> = { ...editableHeaders }
  for (const { item, index } of headerItems) {
    const raw = currentValue(item, index)
    if (raw === '' || raw instanceof File) continue
    baseHeaders[item.name] = String(raw)
  }

  const init: RequestInit = { method }
  const hasBody = ['post', 'put', 'patch'].includes(method)
  const hasExplicitContentType = props.contentType !== undefined
  const hasFiles = fileItems.length > 0

  if (hasBody && (hasExplicitContentType || hasFiles)) {
    const ct: PlaygroundContentType =
      props.contentType ?? (hasFiles ? 'multipart/form-data' : 'application/json')
    const headers = { ...baseHeaders }
    const bodyEntries: Array<[string, string | File]> = []
    for (const [k, v] of Object.entries(data)) {
      bodyEntries.push([k, typeof v === 'string' ? v : JSON.stringify(v)])
    }
    for (const { item, index } of fileItems) {
      const raw = currentValue(item, index)
      if (raw instanceof File) bodyEntries.push([item.name, raw])
    }

    if (ct === 'application/x-www-form-urlencoded') {
      const params = new URLSearchParams()
      for (const [k, v] of bodyEntries) {
        if (typeof v === 'string') params.append(k, v)
      }
      init.body = params.toString()
      if (!findHeaderKey(headers, 'content-type')) headers['Content-Type'] = ct
    } else if (ct === 'multipart/form-data') {
      const fd = new FormData()
      for (const [k, v] of bodyEntries) {
        fd.append(k, v as string | Blob)
      }
      init.body = fd
      const existing = findHeaderKey(headers, 'content-type')
      if (existing) delete headers[existing]
    } else if (ct === 'text/plain') {
      const text = bodyEntries
        .filter(([, v]) => typeof v === 'string')
        .map(([k, v]) => `${k}=${v as string}`)
        .join('\n')
      init.body = text
      if (!findHeaderKey(headers, 'content-type')) headers['Content-Type'] = ct
    } else {
      const jsonObj: Record<string, unknown> = {}
      for (const [k, v] of bodyEntries) {
        if (typeof v === 'string') {
          try {
            jsonObj[k] = JSON.parse(v)
          } catch {
            jsonObj[k] = v
          }
        }
      }
      init.body = JSON.stringify(jsonObj)
      if (!findHeaderKey(headers, 'content-type')) headers['Content-Type'] = ct
    }

    if (Object.keys(headers).length > 0) init.headers = headers
  } else if (hasBody && Object.keys(data).length > 0) {
    init.headers =
      Object.keys(baseHeaders).length > 0 ? baseHeaders : { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(data)
  } else if (hasBody && Object.keys(baseHeaders).length > 0) {
    init.headers = baseHeaders
  } else if (!hasBody && Object.keys(baseHeaders).length > 0) {
    init.headers = baseHeaders
  }

  const queryParams = new URLSearchParams()
  for (const { item, index } of queryItems) {
    const raw = currentValue(item, index)
    if (raw === '' || raw instanceof File) continue
    queryParams.append(item.name, String(raw))
  }
  if (!hasBody) {
    for (const [k, v] of Object.entries(data)) {
      queryParams.append(k, String(v))
    }
  }
  const qs = queryParams.toString()
  if (qs) url = `${url}${url.includes('?') ? '&' : '?'}${qs}`

  emit('execute', { url, init })
}

function applyCurl() {
  curlError.value = ''
  curlWarning.value = ''

  const result = parseCurl(curlInput.value)
  if (!result) {
    curlError.value = 'Could not parse cURL command'
    return
  }

  if (result.ignoredFlags.length > 0) {
    curlWarning.value = `Ignored flags: ${result.ignoredFlags.join(' ')}`
  }

  inputData.value = []
  inputValues.value = []
  for (const key of Object.keys(editableHeaders)) {
    delete editableHeaders[key]
  }

  if (Object.keys(result.headers).length > 0) {
    Object.assign(editableHeaders, result.headers)
  }

  if (result.body) {
    try {
      const parsed = JSON.parse(result.body) as Record<string, unknown>
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const items: PlaygroundDataItem[] = []
        const values: string[] = []
        for (const [name, value] of Object.entries(parsed)) {
          items.push({ name, value: typeof value === 'string' ? value : JSON.stringify(value) })
          values.push(typeof value === 'string' ? value : JSON.stringify(value))
        }
        inputData.value = items
        inputValues.value = values
      }
    } catch {
      inputData.value = [{ name: 'body', value: result.body }]
      inputValues.value = [result.body]
    }
  }

  curlInput.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    emitExecute()
  }
}
</script>
