<template>
  <div class="vap-playground" :class="{ 'vap-playground--dense': dense }">
    <component v-if="showMethod" :is="headingTag" class="vap-playground__method">
      Method:
      <MethodBadge :method="method" />
    </component>

    <component v-if="showUrl" :is="headingTag" class="vap-playground__url">
      URL: <code>{{ url }}</code>
    </component>

    <ApiRequest
      :url="url"
      :method="method"
      :data="data"
      :headers="headers"
      :loading="loading"
      :heading-tag="headingTag"
      :servers="servers"
      :content-type="contentType"
      :body="body"
      :auth="authModel"
      :server="serverModel"
      :dense="dense"
      @update:auth="authModel = $event"
      @update:server="serverModel = $event"
      @execute="handleExecute"
    >
      <template v-if="$slots['send-button']" #send-button="slotProps">
        <slot name="send-button" v-bind="slotProps" />
      </template>
    </ApiRequest>

    <ApiResponse
      :status="response.status"
      :time="response.time"
      :headers="response.headers"
      :body="response.body"
      :request="lastRequest"
      :error="response.error"
      :chunks="response.chunks"
      :streaming="response.streaming"
    >
      <template v-if="$slots['empty-response']" #empty-response>
        <slot name="empty-response" />
      </template>
      <template v-if="$slots.error" #error="slotProps">
        <slot name="error" v-bind="slotProps" />
      </template>
      <template v-if="$slots['response-headers']" #response-headers="slotProps">
        <slot name="response-headers" v-bind="slotProps" />
      </template>
      <template v-if="$slots['response-body']" #response-body="slotProps">
        <slot name="response-body" v-bind="slotProps" />
      </template>
    </ApiResponse>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import type {
  AuthConfig,
  PlaygroundProps,
  RequestErrorPayload,
  RequestStartPayload,
  RequestSuccessPayload,
} from './types'
import type { ApiResponseRequest } from '../ApiResponse/types'
import MethodBadge from '../MethodBadge/MethodBadge.vue'
import ApiRequest from '../ApiRequest/ApiRequest.vue'
import ApiResponse from '../ApiResponse/ApiResponse.vue'

const props = withDefaults(defineProps<PlaygroundProps>(), {
  data: () => [],
  headers: undefined,
  showMethod: false,
  showUrl: false,
  headingTag: 'h4',
  servers: undefined,
  contentType: undefined,
  body: undefined,
  dense: false,
})

const emit = defineEmits<{
  'before-send': [envelope: { url: string; init: RequestInit }]
  'request-start': [payload: RequestStartPayload]
  'request-success': [payload: RequestSuccessPayload]
  'request-error': [payload: RequestErrorPayload]
}>()

const authModel = defineModel<AuthConfig>('auth', {
  default: () => ({ type: 'none' }) as AuthConfig,
})
const serverModel = defineModel<string | undefined>('server', { default: undefined })

const CORS_HINT =
  'Network request failed. The browser may have blocked the request due to CORS or a network error. If you have curl available, try the equivalent shell command.'

const loading = ref(false)
const lastRequest = ref<ApiResponseRequest | undefined>(undefined)
const response = reactive<{
  body: unknown
  status: number | null
  time: number | null
  headers: Record<string, string> | null
  error: string | null
  chunks: string[] | null
  streaming: boolean
}>({
  body: null,
  status: null,
  time: null,
  headers: null,
  error: null,
  chunks: null,
  streaming: false,
})

let abortController: AbortController | null = null

onBeforeUnmount(() => {
  abortController?.abort()
})

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {}
  headers.forEach((value, key) => {
    record[key] = value
  })
  return record
}

function bodyToSerializable(body: BodyInit | null | undefined): string | undefined {
  if (body == null) return undefined
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  if (body instanceof FormData) {
    const parts: string[] = []
    body.forEach((value, key) => {
      parts.push(`${key}=${value instanceof File ? value.name : String(value)}`)
    })
    return parts.join('&')
  }
  return undefined
}

async function handleExecute(request: { url: string; init: RequestInit }) {
  abortController?.abort()
  abortController = new AbortController()

  response.body = null
  response.status = null
  response.time = null
  response.headers = null
  response.error = null
  response.chunks = null
  response.streaming = false
  loading.value = true

  const envelope = {
    url: request.url,
    init: { ...request.init, signal: abortController.signal },
  }
  emit('before-send', envelope)

  const serializedBody = bodyToSerializable(envelope.init.body)

  lastRequest.value = {
    url: envelope.url,
    method: (envelope.init.method ?? props.method).toUpperCase(),
    headers: envelope.init.headers as Record<string, string> | undefined,
    body: serializedBody,
  }

  emit('request-start', {
    url: envelope.url,
    method: (envelope.init.method ?? props.method).toUpperCase(),
    headers: envelope.init.headers as Record<string, string> | undefined,
    body: serializedBody,
  })

  const start = performance.now()

  try {
    const res = await fetch(envelope.url, envelope.init)

    response.status = res.status
    response.time = Math.round(performance.now() - start)

    const headerRecord = headersToRecord(res.headers)
    response.headers = Object.keys(headerRecord).length > 0 ? headerRecord : null

    const ct = res.headers.get('content-type') ?? ''

    if (ct.includes('text/event-stream') && res.body) {
      response.chunks = []
      response.streaming = true
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (chunk) response.chunks.push(chunk)
        }
        const tail = decoder.decode()
        if (tail) response.chunks.push(tail)
      } finally {
        response.streaming = false
      }
      emit('request-success', {
        status: res.status,
        headers: headerRecord,
        body: response.chunks,
        durationMs: response.time ?? 0,
      })
      return
    }

    const text = await res.text()
    try {
      response.body = JSON.parse(text)
    } catch {
      response.body = text
    }

    emit('request-success', {
      status: res.status,
      headers: headerRecord,
      body: response.body,
      durationMs: response.time ?? 0,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    response.time = Math.round(performance.now() - start)
    const message = error instanceof Error ? error.message : String(error)
    response.body = message
    if (error instanceof TypeError) {
      response.error = CORS_HINT
    } else {
      response.error = message
    }
    emit('request-error', {
      error: error instanceof Error ? error : new Error(String(error)),
      durationMs: response.time ?? 0,
    })
  } finally {
    loading.value = false
  }
}
</script>
