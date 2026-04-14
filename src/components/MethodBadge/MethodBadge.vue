<template>
  <span class="vap-badge" :class="`vap-badge--${color}`">
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

const color = computed(() => colors[props.method.toLowerCase()] ?? 'info')
</script>
