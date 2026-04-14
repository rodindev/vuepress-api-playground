<template>
  <div v-if="body !== null" class="vap-response">
    <div class="vap-response__bar">
      <span v-if="status !== null" class="vap-response__status">
        Status:
        <span class="vap-badge" :class="status < 300 ? 'vap-badge--success' : 'vap-badge--danger'">
          {{ status }}
        </span>
      </span>
      <span v-if="time !== null" class="vap-response__time"> {{ time }} ms </span>
      <span v-if="payloadSize" class="vap-response__size">
        {{ payloadSize }}
      </span>
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

    <details v-if="headers" class="vap-response__headers">
      <summary>Response Headers</summary>
      <pre class="vap-code"><code>{{ formattedHeaders }}</code></pre>
    </details>

    <pre
      class="vap-code"
    ><code v-if="highlighted" v-html="highlighted" /><code v-else>{{ formattedResponse }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import type { ApiResponseProps } from './types'
import { toCurl } from '../../utils/curl'
import { highlightJson } from '../../utils/highlight'

const props = defineProps<ApiResponseProps>()

const copiedResponse = ref(false)
const copiedCurl = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null
let curlTimeout: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (copyTimeout) clearTimeout(copyTimeout)
  if (curlTimeout) clearTimeout(curlTimeout)
})

const formattedResponse = computed(() => {
  if (props.body === null) return ''
  if (typeof props.body === 'string') return props.body
  return JSON.stringify(props.body, null, 2)
})

const highlighted = computed(() => {
  const text = formattedResponse.value
  if (!text) return null
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
