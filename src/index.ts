import type { App } from 'vue'
import Playground from './components/Playground/Playground.vue'
import ApiRequest from './components/ApiRequest/ApiRequest.vue'
import ApiResponse from './components/ApiResponse/ApiResponse.vue'
import MethodBadge from './components/MethodBadge/MethodBadge.vue'
import './styles/index.scss'

export type {
  PlaygroundDataItem,
  PlaygroundDataItemType,
  PlaygroundProps,
  PlaygroundContentType,
} from './components/Playground/types'
export type { ApiRequestProps } from './components/ApiRequest/types'
export type { ApiResponseProps, ApiResponseRequest } from './components/ApiResponse/types'
export type { MethodBadgeProps } from './components/MethodBadge/types'
export type { ToCurlInput, ParsedCurl } from './utils/curl'
export type { Snippet, SnippetLanguage, SnippetRequest } from './utils/snippets'

export { Playground, ApiRequest, ApiResponse, MethodBadge }
export { toCurl, parseCurl } from './utils/curl'
export { toCurlSnippet, toFetch, toNode, toPython } from './utils/snippets'

export function install(app: App) {
  app.component('VueApiPlayground', Playground)
}
