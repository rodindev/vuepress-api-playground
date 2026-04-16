import type { AuthConfig, PlaygroundContentType, PlaygroundDataItem } from '../Playground/types'

export interface ApiRequestProps {
  url: string
  method: string
  data?: PlaygroundDataItem[]
  headers?: Record<string, string>
  loading?: boolean
  showMethod?: boolean
  headingTag?: string
  servers?: string[]
  contentType?: PlaygroundContentType
  body?: string
  auth?: AuthConfig
  server?: string
}
