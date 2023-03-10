const { description } = require('../../package')
const basePath = process.env.NODE_ENV === 'production' ? '/vuepress-api-playground/' : '/'
const assetsVersion = '0.1.0'

module.exports = {
  base: basePath,
  title: 'VuePress API Playground',
  description: description,
  head: [
    ['link', { rel: 'icon', href: `/favicon.ico?v=${assetsVersion}` }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }],
    ['meta', { name: 'theme-color', content: '#349adf' }],
    ['meta', { property: 'og:title', content: 'Vuepress API Playground' }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: `https://rodindev.github.io/vuepress-api-playground/og/image.jpg?v=${assetsVersion}` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `https://rodindev.github.io/vuepress-api-playground/og/image.jpg?v=${assetsVersion}` }],
    ['meta', { name: 'twitter:image:src', content: `https://rodindev.github.io/vuepress-api-playground/og/image.jpg?v=${assetsVersion}` }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
    ['link', { rel: 'apple-touch-icon', href: `/apple-touch-icon.png?v=${assetsVersion}` }],
    ['link', { rel: 'mask-icon', href: `/safari-pinned-tab.svg?v=${assetsVersion}`, color: '#5bbad5' }],
    ['meta', { name: 'msapplication-TileImage', content: `/mstile-150x150.png?v=${assetsVersion}` }],
    ['meta', { name: 'msapplication-TileColor', content: '#ffffff' }],

  ],
  themeConfig: {
    repo: 'https://github.com/rodindev/vuepress-api-playground.git',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'Examples',
        link: '/examples/'
      },
    ],
    sidebar: {
      '/docs/': [
        {
          title: 'Docs',
          collapsable: false,
          children: [
            '',
            'installation',
            'usage',
          ]
        }
      ],
    }
  },
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    [
      'vuepress-plugin-google-tag-manager',
      {
        'gtm': 'GTM-WZW8CCN',
      },
    ],
  ]
}
