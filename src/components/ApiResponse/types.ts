export interface ApiResponseRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
}

export interface ApiResponseProps {
  status: number | null
  time: number | null
  headers: Record<string, string> | null
  body: unknown
  request?: ApiResponseRequest
}
