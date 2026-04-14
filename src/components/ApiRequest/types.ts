import type { PlaygroundDataItem } from '../Playground/types'

export interface ApiRequestProps {
  url: string
  method: string
  data?: PlaygroundDataItem[]
  headers?: Record<string, string>
  loading?: boolean
  showMethod?: boolean
  headingTag?: string
}
