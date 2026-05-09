import { toCurlTokens } from './curl'

export type SnippetLanguage = 'curl' | 'fetch' | 'python' | 'node'

export type SnippetTokenType =
  | 'text'
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'flag'
  | 'url'
  | 'identifier'
  | 'punct'

export interface SnippetToken {
  type: SnippetTokenType
  text: string
}

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
  tokens: SnippetToken[]
}

function tok(type: SnippetTokenType, text: string): SnippetToken {
  return { type, text }
}

function hasHeaders(
  headers: Record<string, string> | undefined
): headers is Record<string, string> {
  return Boolean(headers && Object.keys(headers).length > 0)
}

function codeFromTokens(tokens: SnippetToken[]): string {
  return tokens.map((t) => t.text).join('')
}

function jsHeadersBlock(headers: Record<string, string>): SnippetToken[] {
  const out: SnippetToken[] = [
    tok('punct', ','),
    tok('text', '\n  '),
    tok('identifier', 'headers'),
    tok('punct', ':'),
    tok('text', ' '),
    tok('punct', '{'),
  ]
  const entries = Object.entries(headers)
  entries.forEach(([k, v], i) => {
    out.push(tok('text', '\n      '))
    out.push(tok('string', JSON.stringify(k)))
    out.push(tok('punct', ':'))
    out.push(tok('text', ' '))
    out.push(tok('string', JSON.stringify(v)))
    if (i < entries.length - 1) out.push(tok('punct', ','))
  })
  out.push(tok('text', '\n    '))
  out.push(tok('punct', '}'))
  return out
}

function jsBodyLine(body: string): SnippetToken[] {
  return [
    tok('punct', ','),
    tok('text', '\n  '),
    tok('identifier', 'body'),
    tok('punct', ':'),
    tok('text', ' '),
    tok('string', JSON.stringify(body)),
  ]
}

function jsFetchOptions(req: SnippetRequest): SnippetToken[] {
  const out: SnippetToken[] = [
    tok('punct', '{'),
    tok('text', '\n  '),
    tok('identifier', 'method'),
    tok('punct', ':'),
    tok('text', ' '),
    tok('string', JSON.stringify(req.method.toUpperCase())),
  ]
  if (hasHeaders(req.headers)) out.push(...jsHeadersBlock(req.headers))
  if (req.body) out.push(...jsBodyLine(req.body))
  out.push(tok('punct', ','))
  out.push(tok('text', '\n'))
  out.push(tok('punct', '}'))
  return out
}

function jsThenChain(): SnippetToken[] {
  return [
    tok('text', '\n  '),
    tok('punct', '.'),
    tok('function', 'then'),
    tok('punct', '('),
    tok('punct', '('),
    tok('identifier', 'response'),
    tok('punct', ')'),
    tok('text', ' '),
    tok('punct', '=>'),
    tok('text', ' '),
    tok('identifier', 'response'),
    tok('punct', '.'),
    tok('function', 'json'),
    tok('punct', '('),
    tok('punct', ')'),
    tok('punct', ')'),
    tok('text', '\n  '),
    tok('punct', '.'),
    tok('function', 'then'),
    tok('punct', '('),
    tok('punct', '('),
    tok('identifier', 'data'),
    tok('punct', ')'),
    tok('text', ' '),
    tok('punct', '=>'),
    tok('text', ' '),
    tok('identifier', 'console'),
    tok('punct', '.'),
    tok('function', 'log'),
    tok('punct', '('),
    tok('identifier', 'data'),
    tok('punct', ')'),
    tok('punct', ')'),
  ]
}

export function toCurlSnippet(req: SnippetRequest): Snippet {
  const tokens = toCurlTokens(req)
  return { language: 'curl', label: 'cURL', code: codeFromTokens(tokens), tokens }
}

export function toFetch(req: SnippetRequest): Snippet {
  const tokens: SnippetToken[] = [
    tok('function', 'fetch'),
    tok('punct', '('),
    tok('url', JSON.stringify(req.url)),
    tok('punct', ','),
    tok('text', ' '),
    ...jsFetchOptions(req),
    tok('punct', ')'),
    ...jsThenChain(),
  ]
  return { language: 'fetch', label: 'fetch', code: codeFromTokens(tokens), tokens }
}

export function toNode(req: SnippetRequest): Snippet {
  const tokens: SnippetToken[] = [
    tok('keyword', 'const'),
    tok('text', ' '),
    tok('identifier', 'response'),
    tok('text', ' '),
    tok('punct', '='),
    tok('text', ' '),
    tok('keyword', 'await'),
    tok('text', ' '),
    tok('function', 'fetch'),
    tok('punct', '('),
    tok('url', JSON.stringify(req.url)),
    tok('punct', ','),
    tok('text', ' '),
    ...jsFetchOptions(req),
    tok('punct', ')'),
    tok('text', '\n'),
    tok('keyword', 'const'),
    tok('text', ' '),
    tok('identifier', 'data'),
    tok('text', ' '),
    tok('punct', '='),
    tok('text', ' '),
    tok('keyword', 'await'),
    tok('text', ' '),
    tok('identifier', 'response'),
    tok('punct', '.'),
    tok('function', 'json'),
    tok('punct', '('),
    tok('punct', ')'),
    tok('text', '\n'),
    tok('identifier', 'console'),
    tok('punct', '.'),
    tok('function', 'log'),
    tok('punct', '('),
    tok('identifier', 'data'),
    tok('punct', ')'),
  ]
  return { language: 'node', label: 'Node.js', code: codeFromTokens(tokens), tokens }
}

export function toPython(req: SnippetRequest): Snippet {
  const method = req.method.toLowerCase()
  const tokens: SnippetToken[] = [
    tok('keyword', 'import'),
    tok('text', ' '),
    tok('identifier', 'requests'),
    tok('text', '\n\n'),
    tok('identifier', 'url'),
    tok('text', ' '),
    tok('punct', '='),
    tok('text', ' '),
    tok('url', JSON.stringify(req.url)),
    tok('text', '\n'),
  ]

  if (hasHeaders(req.headers)) {
    tokens.push(
      tok('identifier', 'headers'),
      tok('text', ' '),
      tok('punct', '='),
      tok('text', ' '),
      tok('punct', '{')
    )
    const entries = Object.entries(req.headers)
    entries.forEach(([k, v], i) => {
      tokens.push(tok('text', '\n    '))
      tokens.push(tok('string', JSON.stringify(k)))
      tokens.push(tok('punct', ':'))
      tokens.push(tok('text', ' '))
      tokens.push(tok('string', JSON.stringify(v)))
      if (i < entries.length - 1) tokens.push(tok('punct', ','))
    })
    tokens.push(tok('text', '\n'))
    tokens.push(tok('punct', '}'))
    tokens.push(tok('text', '\n'))
  }

  if (req.body) {
    tokens.push(
      tok('identifier', 'data'),
      tok('text', ' '),
      tok('punct', '='),
      tok('text', ' '),
      tok('string', JSON.stringify(req.body)),
      tok('text', '\n')
    )
  }

  tokens.push(
    tok('text', '\n'),
    tok('identifier', 'response'),
    tok('text', ' '),
    tok('punct', '='),
    tok('text', ' '),
    tok('identifier', 'requests'),
    tok('punct', '.'),
    tok('function', method),
    tok('punct', '('),
    tok('identifier', 'url')
  )

  if (hasHeaders(req.headers)) {
    tokens.push(
      tok('punct', ','),
      tok('text', ' '),
      tok('identifier', 'headers'),
      tok('punct', '='),
      tok('identifier', 'headers')
    )
  }

  if (req.body) {
    tokens.push(
      tok('punct', ','),
      tok('text', ' '),
      tok('identifier', 'data'),
      tok('punct', '='),
      tok('identifier', 'data')
    )
  }

  tokens.push(
    tok('punct', ')'),
    tok('text', '\n'),
    tok('function', 'print'),
    tok('punct', '('),
    tok('identifier', 'response'),
    tok('punct', '.'),
    tok('function', 'json'),
    tok('punct', '('),
    tok('punct', ')'),
    tok('punct', ')')
  )

  return { language: 'python', label: 'Python', code: codeFromTokens(tokens), tokens }
}
