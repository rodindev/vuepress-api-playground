
import ComponentLibrary from './../../src/main.js'
import './../../styles/index.stylus'

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  Vue.use(ComponentLibrary);
  /* Vue.component('vuepress-api-playground', async () => {
    const install = await import('./vuepress-api-playground.js');
    await import('../../node_modules/vuepress-api-playground/styles/index.stylus');
    return install.default({});
  }); */
}
