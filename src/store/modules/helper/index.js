/**
* 共通ヘルパー
*/
import axios from '@/plugins/axios';

const actions = {
  /** ロケーションからenvを判別 */
  checkEnv({ commit, state }) {
    if (state.env.flag) return;

    const hostname = location.hostname;
    let env;
    switch (hostname) {
      case 'localhost':
        env = 'local';
        break;
      case 'dev-admin.akagi-venture.jp':
        env = 'develop';
        break;
      case 'admin.akagi-venture.jp':
        env = 'production';
        break;
      default:
        env = 'production';
        break;
    }

    const data = {
      flag: true,
      name: env,
    };

    commit('putEnv', data);
  },

  checkSystemMaster({ commit, rootState }) {
    const systemMasters = [
      'imauji@cicac.jp',
      'sonoda@cicac.jp',
      'fujikawa@cicac.jp',
      'yamaguchi@cicac.jp',
      'amagawa@cicac.jp',
      'iguchi@cicac.jp',
    ];
    const flag = systemMasters.includes(rootState.user.email);
    commit('isSystemMaster', flag);
  },

  reset({ commit }) {
    commit('reset');
  },

  /** backend共通マスターデータ */
  getMaster({ commit }) {
    axios({
      method: 'GET',
      url: '/v1/connection/master',
    })
      .then((response) => {
        commit('putMaster', response.data.master);
      })
      .catch((error) => {
        if (error.response) console.log(error.response.data);
        else console.log(error);
      });
  },

};


const mutations = {
  putEnv(state, data) {
    state.env.flag = data.flag;
    state.env.name = data.name;
  },

  isSystemMaster(state, bool) {
    state.isSystemMaster = bool;
  },

  systemMasters(state, array) {
    state.systemMasters = array;
  },

  reset(state) {
    state.systemMasters = [];
    state.isSystemMaster = false;
    state.env = {
      name: 'production',
      flag: false,
    };
  },

  putMaster(state, data) {
    state.master = data;
  },

};


const state = {
  isSystemMaster: false,
  env: {
    name: 'production',
    flag: false,
  },
  master: {},
};

export default {
  namespaced: true,
  actions,
  mutations,
  state,
};
