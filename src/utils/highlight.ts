const JSON_HIGHLIGHT_THRESHOLD = 102400

export function highlightJson(json: string): string | null {
  if (json.length > JSON_HIGHLIGHT_THRESHOLD) return null

  try {
    JSON.parse(json)
  } catch {
    return null
  }

  return json.replace(
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|([-+]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)/g,
    (
      match,
      key: string | undefined,
      str: string | undefined,
      num: string | undefined,
      bool: string | undefined
    ) => {
      if (key !== undefined) {
        return `<span class="vap-json-key">${key}</span>:`
      }
      if (str !== undefined) {
        return `<span class="vap-json-string">${str}</span>`
      }
      if (num !== undefined) {
        return `<span class="vap-json-number">${num}</span>`
      }
      if (bool !== undefined) {
        return `<span class="vap-json-bool">${bool}</span>`
      }
      return match
    }
  )
}
