import { toCurl } from './curl'

export type SnippetLanguage = 'curl' | 'fetch' | 'python' | 'node'

export interface SnippetRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
}

export interface Snippet {
  language: SnippetLanguage
  label: string
  code: string
}

function indent(block: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return block
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n')
}

function formatHeaders(headers: Record<string, string>): string {
  const entries = Object.entries(headers).map(
    ([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`
  )
  return `{\n${entries.join(',\n')}\n  }`
}

function pythonDict(headers: Record<string, string>): string {
  const entries = Object.entries(headers).map(
    ([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`
  )
  return `{\n${entries.join(',\n')}\n}`
}

function hasHeaders(
  headers: Record<string, string> | undefined
): headers is Record<string, string> {
  return Boolean(headers && Object.keys(headers).length > 0)
}

export function toCurlSnippet(req: SnippetRequest): Snippet {
  return { language: 'curl', label: 'cURL', code: toCurl(req) }
}

export function toFetch(req: SnippetRequest): Snippet {
  const method = req.method.toUpperCase()
  const parts: string[] = [`method: ${JSON.stringify(method)}`]
  if (hasHeaders(req.headers)) {
    parts.push(`headers: ${indent(formatHeaders(req.headers), 2)}`)
  }
  if (req.body) {
    parts.push(`body: ${JSON.stringify(req.body)}`)
  }
  const code = `fetch(${JSON.stringify(req.url)}, {
  ${parts.join(',\n  ')},
})
  .then((response) => response.json())
  .then((data) => console.log(data))`
  return { language: 'fetch', label: 'fetch', code }
}

export function toNode(req: SnippetRequest): Snippet {
  const method = req.method.toUpperCase()
  const parts: string[] = [`method: ${JSON.stringify(method)}`]
  if (hasHeaders(req.headers)) {
    parts.push(`headers: ${indent(formatHeaders(req.headers), 2)}`)
  }
  if (req.body) {
    parts.push(`body: ${JSON.stringify(req.body)}`)
  }
  const code = `const response = await fetch(${JSON.stringify(req.url)}, {
  ${parts.join(',\n  ')},
})
const data = await response.json()
console.log(data)`
  return { language: 'node', label: 'Node.js', code }
}

export function toPython(req: SnippetRequest): Snippet {
  const method = req.method.toLowerCase()
  const lines: string[] = ['import requests', '']
  lines.push(`url = ${JSON.stringify(req.url)}`)
  if (hasHeaders(req.headers)) {
    lines.push(`headers = ${pythonDict(req.headers)}`)
  }
  if (req.body) {
    lines.push(`data = ${JSON.stringify(req.body)}`)
  }
  lines.push('')
  const args: string[] = ['url']
  if (hasHeaders(req.headers)) args.push('headers=headers')
  if (req.body) args.push('data=data')
  lines.push(`response = requests.${method}(${args.join(', ')})`)
  lines.push('print(response.json())')
  return { language: 'python', label: 'Python', code: lines.join('\n') }
}
