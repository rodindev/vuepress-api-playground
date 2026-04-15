<template>
  <span class="vap-badge" :class="classes">
    {{ method.toUpperCase() }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MethodBadgeProps } from './types'

const props = defineProps<MethodBadgeProps>()

const colors: Record<string, string> = {
  get: 'info',
  post: 'success',
  put: 'warning',
  patch: 'warning',
  delete: 'danger',
}

const methodLower = computed(() => props.method.toLowerCase())
const color = computed(() => colors[methodLower.value] ?? 'info')
const classes = computed(() => [
  `vap-badge--${color.value}`,
  'vap-method',
  `vap-method--${methodLower.value}`,
])
</script>
