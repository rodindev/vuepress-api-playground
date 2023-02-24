import * as components from './components';

const ComponentLibrary = {
  install(Vue = {}) {
    Object.values(components).forEach((component) => {
      Vue.component(component.name, component);
    });
  },
};

export default ComponentLibrary;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ComponentLibrary);
}
