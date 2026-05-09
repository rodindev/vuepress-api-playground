import type { SnippetToken } from './snippets'

export interface ToCurlInput {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
}

export interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
  ignoredFlags: string[]
}

function escapeShellArg(value: string): string {
  return value.replace(/'/g, "'\\''")
}

export function toCurlTokens(request: ToCurlInput): SnippetToken[] {
  const tokens: SnippetToken[] = [{ type: 'keyword', text: 'curl' }]

  const method = request.method.toUpperCase()
  if (method !== 'GET') {
    tokens.push(
      { type: 'text', text: ' ' },
      { type: 'flag', text: '-X' },
      { type: 'text', text: ' ' },
      { type: 'text', text: method }
    )
  }

  if (request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      tokens.push(
        { type: 'text', text: ' ' },
        { type: 'flag', text: '-H' },
        { type: 'text', text: ' ' },
        { type: 'string', text: `'${escapeShellArg(`${key}: ${value}`)}'` }
      )
    }
  }

  if (request.body) {
    tokens.push(
      { type: 'text', text: ' ' },
      { type: 'flag', text: '-d' },
      { type: 'text', text: ' ' },
      { type: 'string', text: `'${escapeShellArg(request.body)}'` }
    )
  }

  tokens.push(
    { type: 'text', text: ' ' },
    { type: 'url', text: `'${escapeShellArg(request.url)}'` }
  )

  return tokens
}

export function toCurl(request: ToCurlInput): string {
  return toCurlTokens(request)
    .map((t) => t.text)
    .join('')
}

function tokenize(command: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false
  let escaped = false

  const normalized = command.replace(/\\\n/g, ' ')

  for (const ch of normalized) {
    if (escaped) {
      current += ch
      escaped = false
      continue
    }

    if (ch === '\\' && !inSingle) {
      escaped = true
      continue
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle
      continue
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble
      continue
    }

    if ((ch === ' ' || ch === '\t' || ch === '\n') && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += ch
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

export function parseCurl(command: string): ParsedCurl | null {
  const trimmed = command.trim()
  if (!trimmed) return null

  const tokens = tokenize(trimmed)
  if (tokens.length === 0) return null

  if (tokens[0] === 'curl') {
    tokens.shift()
  }

  let url = ''
  let method = 'GET'
  const headers: Record<string, string> = {}
  let body: string | null = null
  const ignoredFlags: string[] = []

  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]!

    if (token === '-X' || token === '--request') {
      i++
      if (i < tokens.length) {
        method = tokens[i]!.toUpperCase()
      }
    } else if (token === '-H' || token === '--header') {
      i++
      if (i < tokens.length) {
        const header = tokens[i]!
        const colonIndex = header.indexOf(':')
        if (colonIndex > 0) {
          const key = header.slice(0, colonIndex).trim()
          const value = header.slice(colonIndex + 1).trim()
          headers[key] = value
        }
      }
    } else if (token === '-d' || token === '--data') {
      i++
      if (i < tokens.length) {
        body = tokens[i]!
        if (method === 'GET') {
          method = 'POST'
        }
      }
    } else if (token.startsWith('-')) {
      ignoredFlags.push(token)
      if (
        i + 1 < tokens.length &&
        !tokens[i + 1]!.startsWith('-') &&
        !tokens[i + 1]!.startsWith('http')
      ) {
        i++
        ignoredFlags.push(tokens[i]!)
      }
    } else {
      url = token
    }

    i++
  }

  if (!url) return null

  return { url, method, headers, body, ignoredFlags }
}
