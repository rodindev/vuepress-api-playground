import { defineConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8')
) as { version: string }

const base = '/vue-api-playground/'
const siteUrl = `https://rodindev.github.io${base}`
const ogImage = `${siteUrl}og-image.png`
const ogImageAlt = 'Ship runnable APIs in your docs — Vue 3 · VitePress · TypeScript · Zero deps'
const title = 'Vue API Playground'
const tagline = 'Interactive API playground component for Vue 3'
const description =
  'Drop-in Vue 3 component for runnable API examples. Plug-and-play with VitePress or any Vue 3 app — zero dependencies, inherits your theme.'

export default defineConfig({
  title,
  titleTemplate: `:title · ${title}`,
  description,
  base,
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: siteUrl,
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${base}favicon-32.png` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${base}favicon-16.png` }],
    ['link', { rel: 'alternate icon', type: 'image/x-icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${base}apple-touch-icon.png` }],
    ['link', { rel: 'mask-icon', href: `${base}favicon.svg`, color: '#2563eb' }],
    ['link', { rel: 'canonical', href: siteUrl }],

    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'author', content: 'vue-api-playground contributors' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'vue, vue 3, vitepress, api playground, api component, rest, http client, interactive documentation, typescript, vuepress-api-playground',
      },
    ],

    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:site_name', content: title }],
    ['meta', { property: 'og:title', content: `${title} — ${tagline}` }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: ogImageAlt }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: `${title} — ${tagline}` }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:image:alt', content: ogImageAlt }],
  ],

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    siteTitle: title,

    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Examples', link: '/examples/', activeMatch: '/examples/' },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/rodindev/vue-api-playground/blob/main/CHANGELOG.md',
          },
          {
            text: 'Releases',
            link: 'https://github.com/rodindev/vue-api-playground/releases',
          },
          {
            text: 'npm',
            link: 'https://www.npmjs.com/package/vue-api-playground',
          },
        ],
      },
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
        link: 'https://github.com/rodindev/vue-api-playground',
        ariaLabel: 'GitHub repository',
      },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>npm</title><path fill="currentColor" d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/></svg>',
        },
        link: 'https://www.npmjs.com/package/vue-api-playground',
        ariaLabel: 'npm package',
      },
    ],

    editLink: {
      pattern: 'https://github.com/rodindev/vue-api-playground/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present vue-api-playground contributors',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
})
