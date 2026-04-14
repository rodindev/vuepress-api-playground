import { describe, it, expect } from 'vitest'
import { highlightJson } from './highlight'

describe('highlightJson', () => {
  it('returns null for non-JSON strings', () => {
    expect(highlightJson('not json')).toBeNull()
    expect(highlightJson('<html>')).toBeNull()
  })

  it('returns null for strings above 100KB', () => {
    const large = JSON.stringify({ data: 'x'.repeat(120000) })
    expect(highlightJson(large)).toBeNull()
  })

  it('highlights object keys', () => {
    const result = highlightJson('{"name": "test"}')
    expect(result).toContain('<span class="vap-json-key">"name"</span>')
  })

  it('highlights string values', () => {
    const result = highlightJson('{"name": "test"}')
    expect(result).toContain('<span class="vap-json-string">"test"</span>')
  })

  it('highlights numbers', () => {
    const result = highlightJson('{"count": 42}')
    expect(result).toContain('<span class="vap-json-number">42</span>')
  })

  it('highlights booleans and null', () => {
    const result = highlightJson('{"active": true, "deleted": false, "data": null}')
    expect(result).toContain('<span class="vap-json-bool">true</span>')
    expect(result).toContain('<span class="vap-json-bool">false</span>')
    expect(result).toContain('<span class="vap-json-bool">null</span>')
  })

  it('handles nested objects', () => {
    const json = JSON.stringify({ user: { name: 'test', age: 25 } }, null, 2)
    const result = highlightJson(json)
    expect(result).not.toBeNull()
    expect(result).toContain('<span class="vap-json-key">"user"</span>')
    expect(result).toContain('<span class="vap-json-key">"name"</span>')
    expect(result).toContain('<span class="vap-json-number">25</span>')
  })

  it('handles arrays', () => {
    const json = JSON.stringify([1, 'two', true], null, 2)
    const result = highlightJson(json)
    expect(result).not.toBeNull()
    expect(result).toContain('<span class="vap-json-number">1</span>')
    expect(result).toContain('<span class="vap-json-string">"two"</span>')
    expect(result).toContain('<span class="vap-json-bool">true</span>')
  })

  it('returns valid HTML for empty object', () => {
    const result = highlightJson('{}')
    expect(result).not.toBeNull()
    expect(result).toBe('{}')
  })
})
