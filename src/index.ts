import type { App } from 'vue'
import Playground from './components/Playground/Playground.vue'
import ApiRequest from './components/ApiRequest/ApiRequest.vue'
import ApiResponse from './components/ApiResponse/ApiResponse.vue'
import MethodBadge from './components/MethodBadge/MethodBadge.vue'
import './styles/index.scss'

export type { PlaygroundDataItem, PlaygroundProps } from './components/Playground/types'
export type { ApiRequestProps } from './components/ApiRequest/types'
export type { ApiResponseProps, ApiResponseRequest } from './components/ApiResponse/types'
export type { MethodBadgeProps } from './components/MethodBadge/types'
export type { ToCurlInput, ParsedCurl } from './utils/curl'

export { Playground, ApiRequest, ApiResponse, MethodBadge }
export { toCurl, parseCurl } from './utils/curl'

export function install(app: App) {
  app.component('VueApiPlayground', Playground)
}
