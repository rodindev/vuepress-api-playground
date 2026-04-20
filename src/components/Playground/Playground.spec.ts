import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Playground from './Playground.vue'

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

describe('Playground', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ success: true }))
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with required props', () => {
    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com/posts', method: 'get' },
    })
    expect(wrapper.find('.vap-playground').exists()).toBe(true)
    expect(findExecuteButton(wrapper).text()).toBe('Execute')
  })

  it('hides method and URL by default', () => {
    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    expect(wrapper.find('.vap-playground__method').exists()).toBe(false)
    expect(wrapper.find('.vap-playground__url').exists()).toBe(false)
  })

  it('shows method when showMethod is true', () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com',
        method: 'post',
        showMethod: true,
      },
    })
    const method = wrapper.find('.vap-playground__method')
    expect(method.exists()).toBe(true)
    expect(method.text()).toContain('POST')
  })

  it('shows URL when showUrl is true', () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts',
        method: 'get',
        showUrl: true,
      },
    })
    const urlEl = wrapper.find('.vap-playground__url')
    expect(urlEl.exists()).toBe(true)
    expect(urlEl.text()).toContain('https://api.example.com/posts')
  })

  it('renders data fields as inputs', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com',
        method: 'get',
        data: [
          { name: 'userId', value: '1', type: 'number' },
          { name: 'title', value: 'hello' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.vap-input[type]')
    expect(inputs.length).toBe(2)
    expect((inputs[0]!.element as HTMLInputElement).type).toBe('number')
    expect((inputs[1]!.element as HTMLInputElement).type).toBe('text')
  })

  it('renders header inputs when headers are provided', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com',
        method: 'post',
        headers: { Authorization: 'Bearer token123' },
      },
    })
    await wrapper.vm.$nextTick()
    const headerInputs = wrapper.findAll('input.vap-input[aria-label^="Header"]')
    expect(headerInputs.length).toBe(1)
  })

  it('executes GET request with query params', async () => {
    const fetchMock = mockFetch([{ id: 1, title: 'Post' }])
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts',
        method: 'get',
        data: [{ name: 'userId', value: '1' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts?userId=1')
    expect(init.method).toBe('get')
    expect(init.body).toBeUndefined()
  })

  it('executes POST request with JSON body', async () => {
    const fetchMock = mockFetch({ id: 101 }, 201)
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts',
        method: 'post',
        data: [
          { name: 'title', value: 'New Post' },
          { name: 'userId', value: '1' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts')
    expect(init.method).toBe('post')
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'New Post',
      userId: 1,
    })
  })

  it('replaces {param} path parameters in URL', async () => {
    const fetchMock = mockFetch({ id: 5 })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts/{id}',
        method: 'get',
        data: [{ name: 'id', value: '5' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts/5')
  })

  it('replaces <param> path parameters in URL', async () => {
    const fetchMock = mockFetch({ id: 3 })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts/<id>',
        method: 'get',
        data: [{ name: 'id', value: '3' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts/3')
  })

  it('displays response with status badge and time', async () => {
    let callCount = 0
    vi.stubGlobal('performance', {
      now: vi.fn(() => {
        callCount++
        return callCount === 1 ? 0 : 150
      }),
    })
    vi.stubGlobal('fetch', mockFetch({ result: 'ok' }, 200))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

    expect(wrapper.find('.vap-badge--success').text()).toBe('200')
    expect(wrapper.find('.vap-code').text()).toContain('"result"')
    expect(wrapper.find('.vap-response__time').text()).toContain('ms')
  })

  it('shows error badge for 4xx/5xx', async () => {
    vi.stubGlobal('fetch', mockFetch({ error: 'Not found' }, 404))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-badge--danger').exists()).toBe(true))

    expect(wrapper.find('.vap-badge--danger').text()).toBe('404')
  })

  it('handles fetch error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

    expect(wrapper.find('.vap-code').text()).toContain('Failed to fetch')
  })

  it('handles non-JSON response as text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('Plain text response'),
      })
    )

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() =>
      expect(wrapper.find('.vap-code').text()).toContain('Plain text response')
    )
  })

  it('disables button and shows spinner during loading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () => new Promise(() => {}) // never resolves
      )
    )

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await wrapper.vm.$nextTick()

    const btn = findExecuteButton(wrapper)
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toBe('Loading')
    expect(wrapper.find('.vap-spinner').exists()).toBe(true)
  })

  it('shows copy button in response', async () => {
    vi.stubGlobal('fetch', mockFetch({ data: 'test' }, 200))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

    const copyBtn = wrapper.find('[aria-label="Copy response"]')
    expect(copyBtn.exists()).toBe(true)
    expect(copyBtn.text()).toBe('Copy')
  })

  it('shows response headers in collapsible section', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ ok: true }, 200, {
        'content-type': 'application/json',
        'x-request-id': 'abc123',
      })
    )

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response__headers').exists()).toBe(true))

    expect(wrapper.find('.vap-response__headers summary').text()).toBe('Response Headers')
  })

  it('has accessible aria labels on inputs', async () => {
    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com',
        method: 'get',
        data: [{ name: 'userId', value: '1' }],
      },
    })
    await wrapper.vm.$nextTick()

    const input = wrapper.find('[aria-label="userId"]')
    expect(input.exists()).toBe(true)
    expect(findExecuteButton(wrapper).attributes('aria-label')).toBe('Execute request')
  })

  it('applies correct badge color per HTTP method', () => {
    const cases = [
      { method: 'get', expected: 'vap-badge--info' },
      { method: 'post', expected: 'vap-badge--success' },
      { method: 'put', expected: 'vap-badge--warning' },
      { method: 'patch', expected: 'vap-badge--warning' },
      { method: 'delete', expected: 'vap-badge--danger' },
    ]

    for (const { method, expected } of cases) {
      const wrapper = mount(Playground, {
        props: { url: 'https://api.example.com', method, showMethod: true },
      })
      expect(wrapper.find(`.${expected}`).exists()).toBe(true)
      expect(wrapper.find(`.${expected}`).text()).toBe(method.toUpperCase())
    }
  })

  it('executes PUT request with JSON body', async () => {
    const fetchMock = mockFetch({ id: 1 })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts/{id}',
        method: 'put',
        data: [
          { name: 'id', value: '1' },
          { name: 'title', value: 'Updated' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts/1')
    expect(init.method).toBe('put')
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({ title: 'Updated' })
    expect(body).not.toHaveProperty('id')
  })

  it('sends custom headers with POST request', async () => {
    const fetchMock = mockFetch({ ok: true }, 200)
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts',
        method: 'post',
        headers: { Authorization: 'Bearer abc' },
        data: [{ name: 'title', value: 'Test' }],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [, init] = fetchMock.mock.calls[0]!
    expect(init.headers).toEqual({ Authorization: 'Bearer abc' })
  })

  it('hides Data section when no data provided', () => {
    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    expect(wrapper.text()).not.toContain('Data:')
    expect(wrapper.findAll('.vap-table').length).toBe(0)
  })

  it('skips empty values in request data', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/posts',
        method: 'get',
        data: [
          { name: 'userId', value: '1' },
          { name: 'empty', value: '' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/posts?userId=1')
    expect(url).not.toContain('empty')
  })

  it('removes path params from remaining request data', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(Playground, {
      props: {
        url: 'https://api.example.com/users/{userId}/posts',
        method: 'get',
        data: [
          { name: 'userId', value: '5' },
          { name: 'status', value: 'published' },
        ],
      },
    })
    await wrapper.vm.$nextTick()
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/users/5/posts?status=published')
  })

  it('shows cURL button in response after executing', async () => {
    vi.stubGlobal('fetch', mockFetch({ data: 'test' }, 200))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

    const curlBtn = wrapper.find('[aria-label="Copy as cURL"]')
    expect(curlBtn.exists()).toBe(true)
    expect(curlBtn.text()).toBe('cURL')
  })

  it('shows response payload size', async () => {
    vi.stubGlobal('fetch', mockFetch({ data: 'test' }, 200))

    const wrapper = mount(Playground, {
      props: { url: 'https://api.example.com', method: 'get' },
    })
    await findExecuteButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

    expect(wrapper.find('.vap-response__size').exists()).toBe(true)
  })

  describe('dense mode', () => {
    it('renders data grid instead of table when dense is true', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
          data: [
            { name: 'page', value: '1' },
            { name: 'limit', value: '10' },
          ],
        },
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.vap-data-grid').exists()).toBe(true)
      expect(wrapper.find('.vap-table thead').exists()).toBe(false)
    })

    it('renders standard table when dense is false', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: false,
          data: [{ name: 'page', value: '1' }],
        },
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.vap-table').exists()).toBe(true)
      expect(wrapper.find('.vap-data-grid').exists()).toBe(false)
    })

    it('renders labels with for attributes in dense mode', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
          data: [{ name: 'q', value: '' }],
        },
      })
      await wrapper.vm.$nextTick()
      const label = wrapper.find('.vap-data-grid__label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('q')
      expect(label.attributes('for')).toBe('vap-data-0')
    })

    it('renders descriptions when provided in dense mode', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
          data: [{ name: 'q', value: '', description: 'Full-text search query' }],
        },
      })
      await wrapper.vm.$nextTick()
      const desc = wrapper.find('.vap-data-grid__desc')
      expect(desc.exists()).toBe(true)
      expect(desc.text()).toBe('Full-text search query')
      expect(desc.attributes('id')).toBe('vap-desc-0')
    })

    it('links aria-describedby to description id', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
          data: [{ name: 'q', value: '', description: 'Search query' }],
        },
      })
      await wrapper.vm.$nextTick()
      const input = wrapper.find('#vap-data-0')
      expect(input.attributes('aria-describedby')).toBe('vap-desc-0')
    })

    it('omits aria-describedby when no description', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
          data: [{ name: 'q', value: '' }],
        },
      })
      await wrapper.vm.$nextTick()
      const input = wrapper.find('#vap-data-0')
      expect(input.attributes('aria-describedby')).toBeUndefined()
    })

    it('handles file inputs in dense mode', async () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'post',
          dense: true,
          data: [{ name: 'avatar', value: '', type: 'file' }],
        },
      })
      await wrapper.vm.$nextTick()
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
    })

    it('adds dense class to playground wrapper', () => {
      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com',
          method: 'get',
          dense: true,
        },
      })
      expect(wrapper.find('.vap-playground--dense').exists()).toBe(true)
    })

    it('executes requests correctly in dense mode', async () => {
      const fetchMock = mockFetch({ ok: true })
      vi.stubGlobal('fetch', fetchMock)

      const wrapper = mount(Playground, {
        props: {
          url: 'https://api.example.com/items',
          method: 'get',
          dense: true,
          data: [
            { name: 'page', value: '2', type: 'query' },
            { name: 'limit', value: '25', type: 'query' },
          ],
        },
      })
      await wrapper.vm.$nextTick()
      await findExecuteButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
      const url = fetchMock.mock.calls[0]![0] as string
      expect(url).toContain('page=2')
      expect(url).toContain('limit=25')
    })
  })

  describe('response status dot', () => {
    const cases: Array<{ status: number; bucket: string; label: string }> = [
      { status: 200, bucket: '2xx', label: 'Success' },
      { status: 301, bucket: '3xx', label: 'Redirect' },
      { status: 400, bucket: '4xx', label: 'Client error' },
      { status: 500, bucket: '5xx', label: 'Server error' },
    ]

    for (const { status, bucket, label } of cases) {
      it(`applies --${bucket} bucket class and sr-only label for ${status}`, async () => {
        vi.stubGlobal('fetch', mockFetch({ ok: true }, status))

        const wrapper = mount(Playground, {
          props: { url: 'https://api.example.com', method: 'get' },
        })
        await findExecuteButton(wrapper).trigger('click')
        await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

        const statusEl = wrapper.find('.vap-response__status')
        expect(statusEl.classes()).toContain(`vap-response__status--${bucket}`)
        const srOnly = statusEl.find('.vap-sr-only')
        expect(srOnly.exists()).toBe(true)
        expect(srOnly.text()).toBe(label)
      })
    }

    it('announces the bucket label exactly once for 201', async () => {
      vi.stubGlobal('fetch', mockFetch({ id: 1 }, 201))

      const wrapper = mount(Playground, {
        props: { url: 'https://api.example.com', method: 'post' },
      })
      await findExecuteButton(wrapper).trigger('click')
      await vi.waitFor(() => expect(wrapper.find('.vap-response').exists()).toBe(true))

      const occurrences = (wrapper.text().match(/Success/g) ?? []).length
      expect(occurrences).toBe(1)
    })
  })

  describe('SSE streaming and abort', () => {
    type StreamHandle = { abortListener: (() => void) | null }

    function mockSSE(): { fetchFn: ReturnType<typeof vi.fn>; handle: StreamHandle } {
      const handle: StreamHandle = { abortListener: null }
      const fetchFn = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        const signal = init?.signal
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            const onAbort = () => {
              try {
                controller.error(new DOMException('Aborted', 'AbortError'))
              } catch {
                /* already errored */
              }
            }
            if (signal) {
              if (signal.aborted) {
                onAbort()
                return
              }
              signal.addEventListener('abort', onAbort)
              handle.abortListener = onAbort
            }
            controller.enqueue(new TextEncoder().encode('data: hello\n\n'))
          },
        })
        return {
          status: 200,
          headers: new Headers({ 'content-type': 'text/event-stream' }),
          body,
        }
      })
      return { fetchFn, handle }
    }

    it('renders a Stop button while streaming and returns to idle after abort', async () => {
      const { fetchFn } = mockSSE()
      vi.stubGlobal('fetch', fetchFn)

      const wrapper = mount(Playground, {
        props: { url: 'https://api.example.com/events', method: 'get' },
      })
      await findExecuteButton(wrapper).trigger('click')

      const stopBtn = await vi.waitFor(() => {
        const btn = wrapper.find('[aria-label="Stop request"]')
        expect(btn.exists()).toBe(true)
        return btn
      })
      expect(stopBtn.text()).toBe('Stop')

      await stopBtn.trigger('click')

      await vi.waitFor(() => {
        expect(wrapper.find('[aria-label="Stop request"]').exists()).toBe(false)
        expect(wrapper.find('[aria-label="Execute request"]').exists()).toBe(true)
      })
    })

    it('exposes abort and streaming to the send-button slot', async () => {
      const { fetchFn } = mockSSE()
      vi.stubGlobal('fetch', fetchFn)

      const captured: Array<{ streaming: boolean; abort: () => void; execute: () => void }> = []

      const wrapper = mount(Playground, {
        props: { url: 'https://api.example.com/events', method: 'get' },
        slots: {
          'send-button': (slotProps: {
            streaming: boolean
            abort: () => void
            execute: () => void
            loading: boolean
          }) => {
            captured.push({
              streaming: slotProps.streaming,
              abort: slotProps.abort,
              execute: slotProps.execute,
            })
            return h(
              'button',
              {
                'data-test': 'slotted-btn',
                'aria-label': 'Custom send',
                onClick: slotProps.streaming ? slotProps.abort : slotProps.execute,
              },
              slotProps.streaming ? 'Halt' : 'Go'
            )
          },
        },
      })

      await wrapper.find('[data-test="slotted-btn"]').trigger('click')

      await vi.waitFor(() => {
        const latest = captured[captured.length - 1]!
        expect(latest.streaming).toBe(true)
        expect(typeof latest.abort).toBe('function')
      })
      expect(wrapper.find('[data-test="slotted-btn"]').text()).toBe('Halt')

      captured[captured.length - 1]!.abort()

      await vi.waitFor(() => {
        const latest = captured[captured.length - 1]!
        expect(latest.streaming).toBe(false)
      })
      expect(wrapper.find('[data-test="slotted-btn"]').text()).toBe('Go')
    })
  })
})
