import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import Playground from './Playground.vue'
import type { AuthConfig } from './types'

function mockFetch(body: unknown, status = 200, headers?: Record<string, string>) {
  const resHeaders = new Headers(headers)
  return vi.fn().mockResolvedValue({
    status,
    headers: resHeaders,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  })
}

function findExecuteButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[aria-label="Execute request"]')
}

describe('Playground — path-param substitution (type=path)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ ok: true }))
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('substitutes a single explicit path param with encoding', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts/{id}',
        method: 'get',
        data: [{ name: 'id', value: 'a b', type: 'path' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts/a%20b')
  })

  it('substitutes multiple explicit path params', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/users/{userId}/posts/{postId}',
        method: 'get',
        data: [
          { name: 'userId', value: '5', type: 'path' },
          { name: 'postId', value: '99', type: 'path' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/users/5/posts/99')
  })

  it('encodes special characters in path values', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/search/{q}',
        method: 'get',
        data: [{ name: 'q', value: 'hello/world?', type: 'path' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/search/hello%2Fworld%3F')
  })

  it('warns in console for unsubstituted placeholders', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/users/{userId}/posts/{postId}',
        method: 'get',
        data: [{ name: 'userId', value: '1', type: 'path' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(warn).toHaveBeenCalled()
    const msg = warn.mock.calls.map((c) => String(c[0])).join(' ')
    expect(msg).toContain('{postId}')
    warn.mockRestore()
  })
})

describe('Playground — multi-server selector', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ ok: true }))
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('hides selector when ≤1 server provided', () => {
    const w1 = mount(Playground, {
      props: { url: '/x', method: 'get' },
    })
    expect(w1.find('.vap-request__server').exists()).toBe(false)
    const w2 = mount(Playground, {
      props: { url: '/x', method: 'get', servers: ['https://a.example.com'] },
    })
    expect(w2.find('.vap-request__server').exists()).toBe(false)
  })

  it('renders selector when >1 server provided', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: '/x',
        method: 'get',
        servers: ['https://staging.example.com', 'https://prod.example.com'],
      },
    })
    await wrapper.vm.$nextTick()
    const select = wrapper.find('.vap-request__server select')
    expect(select.exists()).toBe(true)
    const opts = select.findAll('option')
    expect(opts.length).toBe(2)
  })

  it('uses first server as default and prepends it to URL', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: '/users',
        method: 'get',
        servers: ['https://staging.example.com', 'https://prod.example.com'],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://staging.example.com/users')
  })

  it('switches base URL when user selects a different server', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: '/users',
        method: 'get',
        servers: ['https://staging.example.com', 'https://prod.example.com'],
      },
    })
    await wrapper.vm.$nextTick()
    const select = wrapper.find('.vap-request__server select')
    await select.setValue('https://prod.example.com')
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://prod.example.com/users')
  })
})

describe('Playground — content-type body handling', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('JSON: serializes body and sets Content-Type when not provided', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/submit',
        method: 'post',
        contentType: 'application/json',
        data: [{ name: 'title', value: 'Hello' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(typeof init.body).toBe('string')
    expect(JSON.parse(init.body as string)).toEqual({ title: 'Hello' })
  })

  it('urlencoded: serializes via URLSearchParams and sets Content-Type', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/submit',
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: [
          { name: 'title', value: 'Hello World' },
          { name: 'tag', value: 'a&b' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    const parsed = new URLSearchParams(init.body as string)
    expect(parsed.get('title')).toBe('Hello World')
    expect(parsed.get('tag')).toBe('a&b')
  })

  it('multipart: builds FormData and leaves Content-Type unset (browser adds boundary)', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/submit',
        method: 'post',
        contentType: 'multipart/form-data',
        data: [{ name: 'title', value: 'Hello' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get('title')).toBe('Hello')
    const headers = (init.headers ?? {}) as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
    expect(headers['content-type']).toBeUndefined()
  })

  it('plain: sends text body and sets text/plain Content-Type', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/submit',
        method: 'post',
        contentType: 'text/plain',
        data: [{ name: 'note', value: 'hi' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('text/plain')
    expect(typeof init.body).toBe('string')
    expect(init.body).toContain('note=hi')
  })
})

describe('Playground — SSE streaming', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('collects event-stream chunks into response.chunks', async () => {
    const encoder = new TextEncoder()
    const chunks = ['data: chunk 1\n\n', 'data: chunk 2\n\n', 'data: chunk 3\n\n']
    let i = 0
    const reader = {
      read: () =>
        i < chunks.length
          ? Promise.resolve({ done: false, value: encoder.encode(chunks[i++]!) })
          : Promise.resolve({ done: true, value: undefined }),
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: { getReader: () => reader },
        text: () => Promise.resolve(''),
      })
    )

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/stream', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))
    await flushPromises()

    const codeBlocks = wrapper.findAll('.vap-code')
    const body = codeBlocks[codeBlocks.length - 1]!.text()
    expect(body).toContain('chunk 1')
    expect(body).toContain('chunk 2')
    expect(body).toContain('chunk 3')
  })
})

describe('Playground — before-send hook', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('lets host mutate headers synchronously before fetch', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
      attrs: {
        onBeforeSend: (envelope: { url: string; init: RequestInit }) => {
          envelope.init.headers = {
            ...(envelope.init.headers as Record<string, string> | undefined),
            Authorization: 'Bearer injected',
          }
        },
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer injected')
  })

  it('lets host rewrite the URL', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
      attrs: {
        onBeforeSend: (envelope: { url: string; init: RequestInit }) => {
          envelope.url = envelope.url.replace('api.example.com', 'proxy.example.com')
        },
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://proxy.example.com/x')
  })
})

describe('Playground — Cmd/Ctrl+Enter shortcut', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('executes on Ctrl+Enter from a data input', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        data: [{ name: 'q', value: 'hi' }],
      },
    })
    await wrapper.vm.$nextTick()
    const input = wrapper.find('[aria-label="q"]')
    await input.trigger('keydown', { key: 'Enter', ctrlKey: true })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
  })

  it('executes on Cmd+Enter (metaKey) anywhere in the request region', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
    })
    await wrapper.vm.$nextTick()
    await wrapper.find('.vap-request').trigger('keydown', { key: 'Enter', metaKey: true })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
  })
})

describe('Playground — slot overrides', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('replaces the default Execute button with #send-button slot', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
      slots: {
        'send-button': (slotProps: { loading: boolean; execute: () => void }) =>
          h(
            'button',
            {
              'aria-label': 'Go',
              class: 'custom-go',
              onClick: slotProps.execute,
            },
            'Go!'
          ),
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.custom-go').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Execute request"]').exists()).toBe(false)
    await wrapper.find('.custom-go').trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
  })

  it('replaces error plaque with #error slot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
      slots: {
        error: '<div class="custom-err">custom error UI</div>',
      },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))
    expect(wrapper.find('.custom-err').exists()).toBe(true)
  })
})

describe('Playground — CORS hint', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows a friendly hint on TypeError: Failed to fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response__hint').exists()).toBe(true))
    expect(wrapper.find('.vap-response__hint').text()).toMatch(/CORS|network/i)
  })
})

describe('Playground — body prop', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('sends the body preset verbatim for application/json', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '{"name":"preset"}',
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('{"name":"preset"}')
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('sends the body preset verbatim for text/plain', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'text/plain',
        body: 'hello world',
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('hello world')
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('text/plain')
  })

  it('sends the body preset verbatim for application/xml', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/xml',
        body: '<root><name>preset</name></root>',
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('<root><name>preset</name></root>')
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/xml')
  })

  it('renders a body textarea when contentType is eligible', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '{}',
      },
    })
    await wrapper.vm.$nextTick()
    const ta = wrapper.find('.vap-request__body-textarea')
    expect(ta.exists()).toBe(true)
    expect((ta.element as HTMLTextAreaElement).value).toBe('{}')
  })

  it('manual edits override the initial body', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '{"a":1}',
      },
    })
    await wrapper.vm.$nextTick()
    const ta = wrapper.find('.vap-request__body-textarea')
    await ta.setValue('{"a":2}')
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('{"a":2}')
  })

  it('external body prop update is ignored once the user has edited', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '{"a":1}',
      },
    })
    await wrapper.vm.$nextTick()
    const ta = wrapper.find('.vap-request__body-textarea')
    await ta.setValue('{"user":"edit"}')

    await wrapper.setProps({ body: '{"external":"update"}' })
    await wrapper.vm.$nextTick()

    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('{"user":"edit"}')
  })

  it('external body prop update rehydrates when user has not touched the field', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '{"a":1}',
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ body: '{"b":2}' })
    await wrapper.vm.$nextTick()

    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('{"b":2}')
  })

  it('does not render body textarea for multipart/form-data', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'multipart/form-data',
        body: 'ignored',
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.vap-request__body-textarea').exists()).toBe(false)
  })

  it('preserves the body when switching between compatible content types', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'post',
        contentType: 'application/json',
        body: '<root/>',
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ contentType: 'application/xml' })
    await wrapper.vm.$nextTick()

    const ta = wrapper.find('.vap-request__body-textarea')
    expect((ta.element as HTMLTextAreaElement).value).toBe('<root/>')

    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.body).toBe('<root/>')
  })
})

describe('Playground — auth config', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('bearer: attaches Authorization header', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'bearer', token: 'abc123' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer abc123')
  })

  it('bearer: no Authorization header when token is empty', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'bearer', token: '' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = (init.headers ?? {}) as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('basic: encodes username:password as base64', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'basic', username: 'alice', password: 's3cret' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe(`Basic ${btoa('alice:s3cret')}`)
  })

  it('basic: no header when both fields are empty', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'basic', username: '', password: '' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = (init.headers ?? {}) as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('apiKey in header: attaches named header', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          value: 'keykey',
        } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    const headers = init.headers as Record<string, string>
    expect(headers['X-API-Key']).toBe('keykey')
  })

  it('apiKey in query: appends to URL', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: {
          type: 'apiKey',
          in: 'query',
          name: 'api_key',
          value: 'keykey',
        } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/x?api_key=keykey')
  })

  it('apiKey in query: no change when value empty', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'apiKey', in: 'query', name: 'api_key', value: '' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/x')
  })

  it('type: none does not render UI or modify request', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'none' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.vap-request__auth').exists()).toBe(false)
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [, init] = fetchMock.mock.calls[0]!
    expect(init.headers).toBeUndefined()
  })

  it('emits update:auth when user edits a field', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/x',
        method: 'get',
        auth: { type: 'bearer', token: 'old' } as AuthConfig,
      },
    })
    await wrapper.vm.$nextTick()
    const input = wrapper.find('[aria-label="Bearer token"]')
    await input.setValue('new-token')
    const emits = wrapper.emitted('update:auth')
    expect(emits).toBeTruthy()
    const last = emits![emits!.length - 1]![0] as AuthConfig
    expect(last).toEqual({ type: 'bearer', token: 'new-token' })
  })
})

describe('Playground — server v-model', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('emits update:server when user picks another server', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: '/x',
        method: 'get',
        servers: ['https://a.example.com', 'https://b.example.com'],
      },
    })
    await wrapper.vm.$nextTick()
    const select = wrapper.find('.vap-request__server select')
    await select.setValue('https://b.example.com')
    const emits = wrapper.emitted('update:server')
    expect(emits).toBeTruthy()
    expect(emits![0]![0]).toBe('https://b.example.com')
  })

  it('uses externally controlled server prop for the request', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: '/z',
        method: 'get',
        servers: ['https://a.example.com', 'https://b.example.com'],
        server: 'https://b.example.com',
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://b.example.com/z')
  })
})

describe('Playground — lifecycle events', () => {
  beforeEach(() => {
    let t = 0
    vi.stubGlobal('performance', {
      now: vi.fn(() => {
        t += 50
        return t
      }),
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('emits request-start before fetch and request-success on success', async () => {
    const fetchMock = mockFetch({ hello: 'world' }, 200, { 'content-type': 'application/json' })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.emitted('request-success')).toBeTruthy())

    const starts = wrapper.emitted('request-start')
    const successes = wrapper.emitted('request-success')
    expect(starts!.length).toBe(1)
    expect(successes!.length).toBe(1)

    const startPayload = starts![0]![0] as { url: string; method: string }
    expect(startPayload.url).toBe('https://api.example.com/x')
    expect(startPayload.method).toBe('GET')

    const successPayload = successes![0]![0] as {
      status: number
      body: unknown
      durationMs: number
      headers: Record<string, string>
    }
    expect(successPayload.status).toBe(200)
    expect(successPayload.body).toEqual({ hello: 'world' })
    expect(typeof successPayload.durationMs).toBe('number')
  })

  it('emits request-error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.emitted('request-error')).toBeTruthy())

    const payload = wrapper.emitted('request-error')![0]![0] as {
      error: Error
      durationMs: number
    }
    expect(payload.error).toBeInstanceOf(Error)
    expect(payload.error.message).toBe('Failed to fetch')
    expect(typeof payload.durationMs).toBe('number')
  })

  it('emits events in order: start → success', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const order: string[] = []
    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/x', method: 'get' },
      attrs: {
        'onRequest-start': () => order.push('start'),
        'onRequest-success': () => order.push('success'),
      },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(order).toContain('success'))
    expect(order).toEqual(['start', 'success'])
  })
})
