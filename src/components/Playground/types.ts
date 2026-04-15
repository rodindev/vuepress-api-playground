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
}
