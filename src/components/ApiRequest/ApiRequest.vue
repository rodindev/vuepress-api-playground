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
                v-model="item.value"
                :type="item.type ?? 'text'"
                class="vap-input"
                :aria-label="item.name"
                @keydown.enter.exact="emitExecute"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <button
      class="vap-btn vap-btn--primary"
      :disabled="loading"
      aria-label="Execute request"
      @click="emitExecute"
    >
      <span v-if="loading" class="vap-spinner" />
      {{ loading ? 'Loading' : 'Execute' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import type { PlaygroundDataItem } from '../Playground/types'
import type { ApiRequestProps } from './types'
import { parseCurl } from '../../utils/curl'
import MethodBadge from '../MethodBadge/MethodBadge.vue'

const props = withDefaults(defineProps<ApiRequestProps>(), {
  data: () => [],
  headers: undefined,
  loading: false,
  showMethod: false,
  headingTag: 'h4',
})

const emit = defineEmits<{
  execute: [request: { url: string; init: RequestInit }]
}>()

const inputData = ref<PlaygroundDataItem[]>([])
const editableHeaders = reactive<Record<string, string>>({})
const curlInput = ref('')
const curlError = ref('')
const curlWarning = ref('')

const visibleHeaders = computed(() => {
  const keys = Object.keys(editableHeaders)
  return keys.length > 0 ? editableHeaders : null
})

onMounted(() => {
  inputData.value = (props.data ?? []).map((item) => ({ ...item }))
  if (props.headers) {
    Object.assign(editableHeaders, props.headers)
  }
})

watch(
  () => props.data,
  (newData) => {
    inputData.value = (newData ?? []).map((item) => ({ ...item }))
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

function emitExecute() {
  if (props.loading) return

  const data = buildRequestData()
  let url = props.url
  const method = props.method.toLowerCase()

  const patterns = [/{([a-zA-Z_-]+)}/g, /<([a-zA-Z_-]+)>/g]
  for (const pattern of patterns) {
    url = url.replace(pattern, (match, key: string) => {
      const value = String(data[key] ?? match)
      delete data[key]
      return value
    })
  }

  const init: RequestInit = { method }

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
        inputData.value = Object.entries(parsed).map(([name, value]) => ({
          name,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        }))
      }
    } catch {
      inputData.value = [{ name: 'body', value: result.body }]
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
