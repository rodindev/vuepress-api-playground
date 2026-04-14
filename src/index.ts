import type { App } from 'vue'
import Playground from './components/Playground/Playground.vue'
import './styles/index.scss'

export type { PlaygroundDataItem, PlaygroundProps } from './components/Playground/types'
export { Playground }

export function install(app: App) {
  app.component('VueApiPlayground', Playground)
}
