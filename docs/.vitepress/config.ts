import { defineConfig } from 'vitepress'

const siteUrl = 'https://rodindev.github.io/vuepress-api-playground/'
const title = 'Vue API Playground'
const description =
  'Interactive API playground component for Vue 3. Plug-and-play with VitePress or any Vue 3 app.'

export default defineConfig({
  title,
  description,
  base: '/vuepress-api-playground/',

  sitemap: {
    hostname: siteUrl,
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'author', content: 'vue-api-playground contributors' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:site_name', content: title }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'vue, vue3, api, playground, vitepress, component, interactive, rest, http, documentation, typescript',
      },
    ],
    ['link', { rel: 'canonical', href: siteUrl }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' },
            { text: 'Customization', link: '/guide/customization' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [{ text: 'All Examples', link: '/examples/' }],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/rodindev/vuepress-api-playground',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present vue-api-playground contributors',
    },

    search: {
      provider: 'local',
    },
  },
})
