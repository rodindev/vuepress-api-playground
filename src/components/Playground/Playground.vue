<template>
  <div class="vap-playground">
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
      @execute="handleExecute"
    />

    <ApiResponse
      :status="response.status"
      :time="response.time"
      :headers="response.headers"
      :body="response.body"
      :request="lastRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import type { PlaygroundProps } from './types'
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
})

const loading = ref(false)
const lastRequest = ref<ApiResponseRequest | undefined>(undefined)
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

onBeforeUnmount(() => {
  abortController?.abort()
})

async function handleExecute(request: { url: string; init: RequestInit }) {
  abortController?.abort()
  abortController = new AbortController()

  response.body = null
  response.status = null
  response.time = null
  response.headers = null
  loading.value = true

  lastRequest.value = {
    url: request.url,
    method: (request.init.method ?? props.method).toUpperCase(),
    headers: request.init.headers as Record<string, string> | undefined,
    body: request.init.body as string | undefined,
  }

  const start = performance.now()

  try {
    const res = await fetch(request.url, {
      ...request.init,
      signal: abortController.signal,
    })

    response.status = res.status
    response.time = Math.round(performance.now() - start)

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
</script>
