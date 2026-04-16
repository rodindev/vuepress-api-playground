export type PlaygroundDataItemType =
  | 'path'
  | 'query'
  | 'header'
  | 'file'
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'url'
  | 'search'
  | 'tel'
  | (string & {})

export interface PlaygroundDataItem {
  name: string
  value: string | File
  type?: PlaygroundDataItemType
}

export type PlaygroundContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'application/xml'

export type AuthConfig =
  | { type: 'none' }
  | { type: 'bearer'; token?: string }
  | { type: 'basic'; username?: string; password?: string }
  | { type: 'apiKey'; in: 'header' | 'query'; name: string; value?: string }

export interface RequestStartPayload {
  url: string
  method: string
  headers: Record<string, string> | undefined
  body: string | undefined
}

export interface RequestSuccessPayload {
  status: number
  headers: Record<string, string>
  body: unknown
  durationMs: number
}

export interface RequestErrorPayload {
  error: Error
  durationMs: number
}

export interface PlaygroundProps {
  url: string
  method: string
  data?: PlaygroundDataItem[]
  headers?: Record<string, string>
  showMethod?: boolean
  showUrl?: boolean
  headingTag?: string
  servers?: string[]
  contentType?: PlaygroundContentType
  body?: string
}
