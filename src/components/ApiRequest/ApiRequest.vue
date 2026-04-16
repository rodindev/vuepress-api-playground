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
      <select
        :value="selectedServer"
        class="vap-input"
        aria-label="Server"
        @change="onServerChange"
      >
        <option v-for="server in servers" :key="server" :value="server">
          {{ server }}
        </option>
      </select>
    </div>

    <div v-if="authLocal.type !== 'none'" class="vap-request__auth">
      <component :is="headingTag">Auth:</component>
      <table class="vap-table">
        <tbody>
          <tr v-if="authLocal.type === 'bearer'">
            <td>Token</td>
            <td>
              <input
                type="password"
                class="vap-input"
                aria-label="Bearer token"
                :value="bearerToken"
                @input="updateAuth('token', ($event.target as HTMLInputElement).value)"
                @keydown.enter.exact="emitExecute"
              />
            </td>
          </tr>
          <template v-else-if="authLocal.type === 'basic'">
            <tr>
              <td>Username</td>
              <td>
                <input
                  type="text"
                  class="vap-input"
                  aria-label="Basic auth username"
                  :value="basicUsername"
                  @input="updateAuth('username', ($event.target as HTMLInputElement).value)"
                  @keydown.enter.exact="emitExecute"
                />
              </td>
            </tr>
            <tr>
              <td>Password</td>
              <td>
                <input
                  type="password"
                  class="vap-input"
                  aria-label="Basic auth password"
                  :value="basicPassword"
                  @input="updateAuth('password', ($event.target as HTMLInputElement).value)"
                  @keydown.enter.exact="emitExecute"
                />
              </td>
            </tr>
          </template>
          <tr v-else-if="authLocal.type === 'apiKey'">
            <td>{{ apiKeyName }} ({{ apiKeyIn }})</td>
            <td>
              <input
                type="password"
                class="vap-input"
                :aria-label="`API key ${apiKeyName}`"
                :value="apiKeyValue"
                @input="updateAuth('value', ($event.target as HTMLInputElement).value)"
                @keydown.enter.exact="emitExecute"
              />
            </td>
          </tr>
        </tbody>
      </table>
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

    <div v-if="bodyEligible" class="vap-request__body">
      <component :is="headingTag">Body:</component>
      <textarea
        v-model="bodyInput"
        class="vap-input vap-request__body-textarea"
        :aria-label="`Request body (${contentType})`"
        rows="6"
        @input="bodyDirty = true"
      />
    </div>

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
import type { AuthConfig, PlaygroundContentType, PlaygroundDataItem } from '../Playground/types'
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
  body: undefined,
  auth: undefined,
  server: undefined,
})

const emit = defineEmits<{
  execute: [request: { url: string; init: RequestInit }]
  'update:auth': [value: AuthConfig]
  'update:server': [value: string]
}>()

defineSlots<{
  'send-button'(props: { loading: boolean; execute: () => void }): unknown
}>()

const BODY_ELIGIBLE_TYPES: PlaygroundContentType[] = [
  'application/json',
  'text/plain',
  'application/xml',
]

const inputData = ref<PlaygroundDataItem[]>([])
const inputValues = ref<string[]>([])
const editableHeaders = reactive<Record<string, string>>({})
const curlInput = ref('')
const curlError = ref('')
const curlWarning = ref('')

const selectedServer = ref<string>(props.server ?? props.servers?.[0] ?? '')

const bodyInput = ref<string>(props.body ?? '')
const bodyDirty = ref(false)

function cloneAuth(a: AuthConfig | undefined): AuthConfig {
  if (!a) return { type: 'none' }
  return { ...a } as AuthConfig
}

const authLocal = reactive<AuthConfig>(cloneAuth(props.auth))

const bearerToken = computed(() => (authLocal.type === 'bearer' ? (authLocal.token ?? '') : ''))
const basicUsername = computed(() => (authLocal.type === 'basic' ? (authLocal.username ?? '') : ''))
const basicPassword = computed(() => (authLocal.type === 'basic' ? (authLocal.password ?? '') : ''))
const apiKeyValue = computed(() => (authLocal.type === 'apiKey' ? (authLocal.value ?? '') : ''))
const apiKeyName = computed(() => (authLocal.type === 'apiKey' ? authLocal.name : ''))
const apiKeyIn = computed(() => (authLocal.type === 'apiKey' ? authLocal.in : ''))

const bodyEligible = computed(() => {
  if (!props.contentType) return false
  if (!BODY_ELIGIBLE_TYPES.includes(props.contentType)) return false
  return ['post', 'put', 'patch'].includes(props.method.toLowerCase())
})

watch(
  () => props.body,
  (newBody) => {
    if (bodyDirty.value) return
    bodyInput.value = newBody ?? ''
  }
)

watch(
  () => props.contentType,
  (ct) => {
    if (ct && !BODY_ELIGIBLE_TYPES.includes(ct) && props.body !== undefined) {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.warn(
          `[vap] body prop is ignored for contentType="${ct}" — supported: ${BODY_ELIGIBLE_TYPES.join(', ')}`
        )
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.server,
  (newServer) => {
    if (newServer !== undefined && newServer !== selectedServer.value) {
      selectedServer.value = newServer
    }
  }
)

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

watch(
  () => props.auth,
  (newAuth) => {
    const prev = authLocal as { type: string; [key: string]: unknown }
    for (const k of Object.keys(prev)) delete prev[k]
    Object.assign(authLocal, cloneAuth(newAuth))
  }
)

function onServerChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  selectedServer.value = val
  emit('update:server', val)
}

function updateAuth(field: string, value: string) {
  if (authLocal.type === 'bearer' && field === 'token') {
    authLocal.token = value
  } else if (authLocal.type === 'basic' && (field === 'username' || field === 'password')) {
    authLocal[field] = value
  } else if (authLocal.type === 'apiKey' && field === 'value') {
    authLocal.value = value
  }
  emit('update:auth', { ...authLocal })
}

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

function applyAuthToRequest(
  headers: Record<string, string>,
  url: string
): { headers: Record<string, string>; url: string } {
  const a = authLocal as AuthConfig
  if (a.type === 'none' || !a.type) return { headers, url }

  if (a.type === 'bearer') {
    const token = (a.token ?? '').trim()
    if (token && !findHeaderKey(headers, 'authorization')) {
      headers.Authorization = `Bearer ${token}`
    }
    return { headers, url }
  }

  if (a.type === 'basic') {
    const u = a.username ?? ''
    const p = a.password ?? ''
    if ((u || p) && !findHeaderKey(headers, 'authorization')) {
      const encoded =
        typeof btoa === 'function' ? btoa(`${u}:${p}`) : Buffer.from(`${u}:${p}`).toString('base64')
      headers.Authorization = `Basic ${encoded}`
    }
    return { headers, url }
  }

  if (a.type === 'apiKey') {
    const value = (a.value ?? '').trim()
    if (!value || !a.name) return { headers, url }
    if (a.in === 'header') {
      if (!findHeaderKey(headers, a.name)) headers[a.name] = value
      return { headers, url }
    }
    if (a.in === 'query') {
      const sep = url.includes('?') ? '&' : '?'
      const nextUrl = `${url}${sep}${encodeURIComponent(a.name)}=${encodeURIComponent(value)}`
      return { headers, url: nextUrl }
    }
  }

  return { headers, url }
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
  const useRawBody =
    hasBody &&
    hasExplicitContentType &&
    BODY_ELIGIBLE_TYPES.includes(props.contentType as PlaygroundContentType) &&
    props.body !== undefined

  if (useRawBody) {
    const ct = props.contentType as PlaygroundContentType
    const headers = { ...baseHeaders }
    init.body = bodyInput.value
    if (!findHeaderKey(headers, 'content-type')) headers['Content-Type'] = ct
    if (Object.keys(headers).length > 0) init.headers = headers
  } else if (hasBody && (hasExplicitContentType || hasFiles)) {
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
        fd.append(k, v)
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
    } else if (ct === 'application/xml') {
      const text = bodyEntries
        .filter(([, v]) => typeof v === 'string')
        .map(([k, v]) => `<${k}>${v as string}</${k}>`)
        .join('')
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

  const effectiveHeaders: Record<string, string> = {
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  }
  const applied = applyAuthToRequest(effectiveHeaders, url)
  url = applied.url
  if (Object.keys(applied.headers).length > 0) {
    init.headers = applied.headers
  }

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
