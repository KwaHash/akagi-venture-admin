/**
* ページ情報管理
*/

const actions = {
  /** ページ情報のセット */
  setPageInfo({ commit }, meta) {
    commit('setPageInfo', meta);
  },
};


const mutations = {
  setPageInfo(state, args) {
    const keys = Object.keys(args);
    keys.some((key) => {
      state[key] = args[key];
      return false;
    });
  },
};

const state = {
  name: '',
  title: '',
  description: '',
  og_image: '',
  og_url: '',
  type: '',
};


export default {
  namespaced: true,
  actions,
  mutations,
  state,
};
