import { describe, it, expect } from 'vitest'
import { toCurlSnippet, toFetch, toNode, toPython } from './snippets'

describe('toCurlSnippet', () => {
  it('returns cURL snippet with language and label', () => {
    const snippet = toCurlSnippet({ url: 'https://api.example.com', method: 'GET' })
    expect(snippet.language).toBe('curl')
    expect(snippet.label).toBe('cURL')
    expect(snippet.code).toContain('curl')
    expect(snippet.code).toContain("'https://api.example.com'")
  })
})

describe('toFetch', () => {
  it('generates fetch() call with method', () => {
    const snippet = toFetch({ url: 'https://api.example.com', method: 'GET' })
    expect(snippet.language).toBe('fetch')
    expect(snippet.code).toContain('fetch(')
    expect(snippet.code).toContain('"GET"')
    expect(snippet.code).toContain('.then(')
  })

  it('includes headers when provided', () => {
    const snippet = toFetch({
      url: 'https://api.example.com',
      method: 'POST',
      headers: { Authorization: 'Bearer abc' },
    })
    expect(snippet.code).toContain('headers:')
    expect(snippet.code).toContain('"Authorization"')
    expect(snippet.code).toContain('"Bearer abc"')
  })

  it('includes body when provided', () => {
    const snippet = toFetch({
      url: 'https://api.example.com',
      method: 'POST',
      body: '{"name":"test"}',
    })
    expect(snippet.code).toContain('body:')
    expect(snippet.code).toContain('name')
  })
})

describe('toNode', () => {
  it('generates async/await Node.js snippet', () => {
    const snippet = toNode({ url: 'https://api.example.com', method: 'GET' })
    expect(snippet.language).toBe('node')
    expect(snippet.code).toContain('const response = await fetch(')
    expect(snippet.code).toContain('const data = await response.json()')
  })
})

describe('toPython', () => {
  it('generates requests-based Python snippet', () => {
    const snippet = toPython({ url: 'https://api.example.com', method: 'GET' })
    expect(snippet.language).toBe('python')
    expect(snippet.code).toContain('import requests')
    expect(snippet.code).toContain('requests.get(')
    expect(snippet.code).toContain('response.json()')
  })

  it('emits headers dict when provided', () => {
    const snippet = toPython({
      url: 'https://api.example.com',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(snippet.code).toContain('headers =')
    expect(snippet.code).toContain('"Content-Type"')
    expect(snippet.code).toContain('headers=headers')
  })

  it('emits data arg when body provided', () => {
    const snippet = toPython({
      url: 'https://api.example.com',
      method: 'POST',
      body: '{"k":"v"}',
    })
    expect(snippet.code).toContain('data =')
    expect(snippet.code).toContain('data=data')
  })
})

describe('snippet tokens', () => {
  it('tokens concat to code', () => {
    const cases = [
      () => toCurlSnippet({ url: 'https://api.example.com', method: 'GET' }),
      () =>
        toCurlSnippet({
          url: 'https://api.example.com',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer abc' },
          body: '{"k":"v"}',
        }),
      () => toFetch({ url: 'https://api.example.com', method: 'GET' }),
      () =>
        toFetch({
          url: 'https://api.example.com',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer abc' },
          body: '{"k":"v"}',
        }),
      () => toNode({ url: 'https://api.example.com', method: 'GET' }),
      () =>
        toNode({
          url: 'https://api.example.com',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"k":"v"}',
        }),
      () => toPython({ url: 'https://api.example.com', method: 'GET' }),
      () =>
        toPython({
          url: 'https://api.example.com',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"k":"v"}',
        }),
    ]
    for (const make of cases) {
      const snippet = make()
      expect(snippet.tokens.map((t) => t.text).join('')).toBe(snippet.code)
    }
  })

  it('curl tokens start with curl keyword and include flag and url', () => {
    const { tokens } = toCurlSnippet({
      url: 'https://api.example.com',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(tokens[0]).toEqual({ type: 'keyword', text: 'curl' })
    expect(tokens.some((t) => t.type === 'flag')).toBe(true)
    expect(tokens.some((t) => t.type === 'url')).toBe(true)
  })

  it('fetch tokens carry function call and url', () => {
    const { tokens } = toFetch({ url: 'https://api.example.com', method: 'GET' })
    expect(tokens.some((t) => t.type === 'function' && t.text === 'fetch')).toBe(true)
    expect(tokens.some((t) => t.type === 'function' && t.text === 'then')).toBe(true)
    expect(tokens.some((t) => t.type === 'url')).toBe(true)
  })

  it('node tokens use const and await keywords', () => {
    const { tokens } = toNode({ url: 'https://api.example.com', method: 'GET' })
    expect(tokens.some((t) => t.type === 'keyword' && t.text === 'const')).toBe(true)
    expect(tokens.some((t) => t.type === 'keyword' && t.text === 'await')).toBe(true)
    expect(tokens.some((t) => t.type === 'function' && t.text === 'fetch')).toBe(true)
  })

  it('python tokens import requests and call method function', () => {
    const { tokens } = toPython({ url: 'https://api.example.com', method: 'POST' })
    expect(tokens.some((t) => t.type === 'keyword' && t.text === 'import')).toBe(true)
    expect(tokens.some((t) => t.type === 'function' && t.text === 'post')).toBe(true)
    expect(tokens.some((t) => t.type === 'function' && t.text === 'print')).toBe(true)
  })
})
