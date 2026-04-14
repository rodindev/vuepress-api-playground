export interface PlaygroundDataItem {
  name: string
  value: string
  type?: string
}

export interface PlaygroundProps {
  url: string
  method: string
  data?: PlaygroundDataItem[]
  headers?: Record<string, string>
  showMethod?: boolean
  showUrl?: boolean
  headingTag?: string
}
