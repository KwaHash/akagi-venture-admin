import { createStore } from 'vuex';
import helper from './modules/helper';
import page from './modules/page';
import user from './modules/user';
import modal from './modules/modal';

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    helper,
    page,
    user,
    modal,
  },
});
