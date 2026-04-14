import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { Playground, ApiRequest, ApiResponse, MethodBadge } from '../../../src/index'
import '../../../src/styles/index.scss'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueApiPlayground', Playground)
    app.component('ApiRequest', ApiRequest)
    app.component('ApiResponse', ApiResponse)
    app.component('MethodBadge', MethodBadge)
  },
} satisfies Theme
