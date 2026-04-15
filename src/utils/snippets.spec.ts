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
