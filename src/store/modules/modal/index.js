/**
 * モーダル制御
 */

import contents from '@/store/modules/modal/contents';
import messages from '@/store/modules/modal/messages';
import loadings from '@/store/modules/modal/loadings';

const actions = {
};

const mutations = {
};

const state = {
};

export default {
  namespaced: true,
  actions,
  mutations,
  state,
  modules: {
    contents,
    loadings,
    messages,
  },
};
