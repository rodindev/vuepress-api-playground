import { describe, it, expect } from 'vitest'
import { toCurl, parseCurl } from './curl'

describe('toCurl', () => {
  it('generates basic GET request', () => {
    expect(toCurl({ url: 'https://api.example.com', method: 'GET' })).toBe(
      "curl 'https://api.example.com'"
    )
  })

  it('generates POST request with method', () => {
    const result = toCurl({ url: 'https://api.example.com', method: 'POST' })
    expect(result).toContain('-X POST')
    expect(result).toContain("'https://api.example.com'")
  })

  it('includes headers as -H flags', () => {
    const result = toCurl({
      url: 'https://api.example.com',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer abc' },
    })
    expect(result).toContain("-H 'Content-Type: application/json'")
    expect(result).toContain("-H 'Authorization: Bearer abc'")
  })

  it('includes body as -d flag', () => {
    const result = toCurl({
      url: 'https://api.example.com',
      method: 'POST',
      body: '{"name":"test"}',
    })
    expect(result).toContain('-d \'{"name":"test"}\'')
  })

  it('escapes single quotes in body', () => {
    const result = toCurl({
      url: 'https://api.example.com',
      method: 'POST',
      body: "it's a test",
    })
    expect(result).toContain("'it'\\''s a test'")
  })

  it('escapes single quotes in URL', () => {
    const result = toCurl({
      url: "https://api.example.com/search?q=it's",
      method: 'GET',
    })
    expect(result).toContain("'https://api.example.com/search?q=it'\\''s'")
  })

  it('escapes single quotes in header values', () => {
    const result = toCurl({
      url: 'https://api.example.com',
      method: 'GET',
      headers: { 'X-Custom': "val'ue" },
    })
    expect(result).toContain("'X-Custom: val'\\''ue'")
  })
})

describe('parseCurl', () => {
  it('returns null for empty input', () => {
    expect(parseCurl('')).toBeNull()
    expect(parseCurl('  ')).toBeNull()
  })

  it('returns null for input without URL', () => {
    expect(parseCurl('curl -X POST')).toBeNull()
  })

  it('parses basic GET request', () => {
    const result = parseCurl('curl https://api.example.com')
    expect(result).not.toBeNull()
    expect(result!.url).toBe('https://api.example.com')
    expect(result!.method).toBe('GET')
  })

  it('parses explicit method', () => {
    const result = parseCurl('curl -X POST https://api.example.com')
    expect(result!.method).toBe('POST')
  })

  it('parses --request flag', () => {
    const result = parseCurl('curl --request PUT https://api.example.com')
    expect(result!.method).toBe('PUT')
  })

  it('parses headers', () => {
    const result = parseCurl(
      "curl -H 'Content-Type: application/json' -H 'Authorization: Bearer abc' https://api.example.com"
    )
    expect(result!.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer abc',
    })
  })

  it('parses body and defaults to POST', () => {
    const result = parseCurl('curl -d \'{"name":"test"}\' https://api.example.com')
    expect(result!.body).toBe('{"name":"test"}')
    expect(result!.method).toBe('POST')
  })

  it('keeps explicit method when body is present', () => {
    const result = parseCurl('curl -X PUT -d \'{"name":"test"}\' https://api.example.com')
    expect(result!.method).toBe('PUT')
    expect(result!.body).toBe('{"name":"test"}')
  })

  it('handles double-quoted arguments', () => {
    const result = parseCurl('curl -H "Content-Type: application/json" https://api.example.com')
    expect(result!.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('reports ignored flags', () => {
    const result = parseCurl('curl --compressed -H "Accept: */*" https://api.example.com')
    expect(result!.ignoredFlags).toContain('--compressed')
    expect(result!.headers).toEqual({ Accept: '*/*' })
  })

  it('handles backslash line continuation', () => {
    const result = parseCurl(
      "curl \\\n  -X POST \\\n  -H 'Content-Type: application/json' \\\n  https://api.example.com"
    )
    expect(result!.method).toBe('POST')
    expect(result!.url).toBe('https://api.example.com')
  })

  it('handles input without curl prefix', () => {
    const result = parseCurl('https://api.example.com')
    expect(result).not.toBeNull()
    expect(result!.url).toBe('https://api.example.com')
  })
})
