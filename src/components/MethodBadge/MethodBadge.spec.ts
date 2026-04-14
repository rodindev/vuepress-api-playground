import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MethodBadge from './MethodBadge.vue'

describe('MethodBadge', () => {
  it('renders method text in uppercase', () => {
    const wrapper = mount(MethodBadge, { props: { method: 'get' } })
    expect(wrapper.text()).toBe('GET')
  })

  it('applies correct color class per method', () => {
    const cases = [
      { method: 'get', expected: 'vap-badge--info' },
      { method: 'post', expected: 'vap-badge--success' },
      { method: 'put', expected: 'vap-badge--warning' },
      { method: 'patch', expected: 'vap-badge--warning' },
      { method: 'delete', expected: 'vap-badge--danger' },
    ]

    for (const { method, expected } of cases) {
      const wrapper = mount(MethodBadge, { props: { method } })
      expect(wrapper.find(`.${expected}`).exists()).toBe(true)
    }
  })

  it('falls back to info color for unknown methods', () => {
    const wrapper = mount(MethodBadge, { props: { method: 'options' } })
    expect(wrapper.find('.vap-badge--info').exists()).toBe(true)
    expect(wrapper.text()).toBe('OPTIONS')
  })

  it('has vap-badge base class', () => {
    const wrapper = mount(MethodBadge, { props: { method: 'get' } })
    expect(wrapper.find('.vap-badge').exists()).toBe(true)
  })
})
