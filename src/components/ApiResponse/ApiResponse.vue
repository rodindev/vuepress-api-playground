<template>
  <div v-if="hasResponse" class="vap-response">
    <div class="vap-response__bar">
      <span v-if="status !== null" class="vap-response__status" :class="statusBucketClass">
        Status:
        <span v-if="statusBucketLabel" class="vap-sr-only">{{ statusBucketLabel }}</span>
        <span class="vap-badge" :class="status < 300 ? 'vap-badge--success' : 'vap-badge--danger'">
          {{ status }}
        </span>
      </span>
      <span v-if="time !== null" class="vap-response__time"> {{ time }} ms </span>
      <span v-if="payloadSize" class="vap-response__size">
        {{ payloadSize }}
      </span>
      <span v-if="streaming" class="vap-response__streaming" aria-live="polite"> streaming… </span>
      <button
        class="vap-btn vap-btn--secondary"
        :aria-label="copiedResponse ? 'Copied' : 'Copy response'"
        @click="copyResponse"
      >
        {{ copiedResponse ? 'Copied!' : 'Copy' }}
      </button>
      <button
        v-if="request"
        class="vap-btn vap-btn--secondary"
        :aria-label="copiedCurl ? 'Copied' : 'Copy as cURL'"
        @click="copyCurl"
      >
        {{ copiedCurl ? 'Copied!' : 'cURL' }}
      </button>
    </div>

    <slot v-if="error" name="error" :error="error" :request="request">
      <div class="vap-response__hint" role="alert">
        {{ error }}
      </div>
    </slot>

    <slot name="response-headers" :headers="headers">
      <details v-if="headers" class="vap-response__headers">
        <summary>Response Headers</summary>
        <pre class="vap-code"><code>{{ formattedHeaders }}</code></pre>
      </details>
    </slot>

    <slot
      name="response-body"
      :body="body"
      :formatted="formattedResponse"
      :highlighted="highlighted"
      :chunks="chunks"
    >
      <pre
        class="vap-code"
      ><code v-if="highlighted" v-html="highlighted" /><code v-else>{{ formattedResponse }}</code></pre>
    </slot>
  </div>
  <slot v-else name="empty-response" />
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import type { ApiResponseProps } from './types'
import { toCurl } from '../../utils/curl'
import { highlightJson } from '../../utils/highlight'

const props = defineProps<ApiResponseProps>()

defineSlots<{
  'empty-response'(): unknown
  error(props: { error: string; request: ApiResponseProps['request'] }): unknown
  'response-headers'(props: { headers: ApiResponseProps['headers'] }): unknown
  'response-body'(props: {
    body: unknown
    formatted: string
    highlighted: string | null
    chunks: string[] | null | undefined
  }): unknown
}>()

const copiedResponse = ref(false)
const copiedCurl = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null
let curlTimeout: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (copyTimeout) clearTimeout(copyTimeout)
  if (curlTimeout) clearTimeout(curlTimeout)
})

const statusBucketClass = computed(() => {
  if (props.status === null || props.status === undefined) return null
  const hundreds = Math.floor(props.status / 100)
  if (hundreds >= 2 && hundreds <= 5) return `vap-response__status--${hundreds}xx`
  return null
})

const statusBucketLabel = computed(() => {
  if (props.status === null || props.status === undefined) return null
  const hundreds = Math.floor(props.status / 100)
  switch (hundreds) {
    case 1:
      return 'Informational'
    case 2:
      return 'Success'
    case 3:
      return 'Redirect'
    case 4:
      return 'Client error'
    case 5:
      return 'Server error'
    default:
      return null
  }
})

const hasResponse = computed(() => {
  if (props.body !== null && props.body !== undefined) return true
  if (props.chunks && props.chunks.length > 0) return true
  if (props.streaming) return true
  if (props.error) return true
  return false
})

const formattedResponse = computed(() => {
  if (props.chunks && props.chunks.length > 0) return props.chunks.join('')
  if (props.body === null || props.body === undefined) return ''
  if (typeof props.body === 'string') return props.body
  return JSON.stringify(props.body, null, 2)
})

const highlighted = computed(() => {
  const text = formattedResponse.value
  if (!text) return null
  if (props.chunks && props.chunks.length > 0) return null
  return highlightJson(text)
})

const formattedHeaders = computed(() => {
  if (!props.headers) return ''
  return Object.entries(props.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
})

const payloadSize = computed(() => {
  const text = formattedResponse.value
  if (!text) return null
  const bytes = new Blob([text]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
})

async function copyResponse() {
  try {
    await navigator.clipboard.writeText(formattedResponse.value)
    copiedResponse.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copiedResponse.value = false
    }, 2000)
  } catch {
    // Clipboard API not available
  }
}

async function copyCurl() {
  if (!props.request) return
  try {
    const curl = toCurl(props.request)
    await navigator.clipboard.writeText(curl)
    copiedCurl.value = true
    if (curlTimeout) clearTimeout(curlTimeout)
    curlTimeout = setTimeout(() => {
      copiedCurl.value = false
    }, 2000)
  } catch {
    // Clipboard API not available
  }
}
</script>
