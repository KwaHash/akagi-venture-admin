/**
 * モーダルローディング
 */

const actions = {
  /**
   * モーダル表示
   * @param obj args
   *   modalName: @/components/modal/contents/xxx.vueのコンポーネント名
   *   data: 表示する内容のデータ
   */
  showModal({ commit }, args) {
    commit('setModal', args);
  },

  /**
   * モーダル非表示
   */
  hideModal({ commit }, payload = null) {
    if (payload) {
      // 非表示時の独自処理がある場合はここに記述
      // console.log(payload);
    }
    commit('hideModal');
  },
};

const mutations = {
  setModal(state, args) {
    state.modalName = args.modalName;
  },

  hideModal(state) {
    state.modalName = '';
  },
};

const state = {
  modalName: '',
};

export default {
  namespaced: true,
  actions,
  mutations,
  state,
};
