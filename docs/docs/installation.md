# Installation

To install the VuePress API Playground component in your VuePress project, you can use npm or yarn.

Using npm:

``` bash
npm install vuepress-api-playground --save-dev
```

Using yarn:

``` bash
yarn add vuepress-api-playground --dev
```

Once you have installed the component, you can import it into your ``enhanceApp.js`` file and optionally provide your own custom styles for the component.

## VuePress v1.x

1. Open the ``enhanceApp.js`` file in your VuePress project and add the following code:

  ``` js{1-2,5}
  import VuepressApiPlayground from 'vuepress-api-playground'
  import 'vuepress-api-playground/styles/index.stylus' // optional

  export default ({ Vue }) => {
    Vue.use(VuepressApiPlayground)
  }
  ```

  Note that if you want to use the default styles from the package, you need to import the ``index.stylus`` file from the ``vuepress-api-playground/styles`` directory. If you want to use your own custom styles, you can import your custom styles file instead of this file.

2. If you choose to write your own custom styles, you can import your custom styles in the ``enhanceApp.js`` file as shown above.

With these changes made, the VuePress API Playground component is now installed and ready to be used in your VuePress v1.x documentation.

## VuePress v2.x

1. Open the ``client.js`` file in your VuePress project and add the following code:

  ``` js{2-3,7}
  import { defineClientConfig } from '@vuepress/client'
  import VuepressApiPlayground from 'vuepress-api-playground/src/components/Playground/Playground.vue'
  import 'vuepress-api-playground/styles/index.scss' // optional

  export default defineClientConfig({
    enhance({ app }) {
      app.component('VuepressApiPlayground', VuepressApiPlayground)
    },
  })
  ```

  Note that if you want to use the default styles from the package, you need to import the ``index.scss`` file from the ``vuepress-api-playground/styles`` directory. If you want to use your own custom styles, you can import your custom styles file instead of this file.

2. If you choose to write your own custom styles, you can import your custom styles in the ``client.js`` file as shown above.

With these changes made, the VuePress API Playground component is now installed and ready to be used in your VuePress v2.x documentation.