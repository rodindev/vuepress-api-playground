import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { Playground } from '../../../src/index'
import '../../../src/styles/index.scss'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VueApiPlayground', Playground)
  },
} satisfies Theme
