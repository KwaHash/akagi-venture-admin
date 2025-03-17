/**
* ユーザー管理関連
*/

import axios from '@/plugins/axios';
import cf from '@/mixins/commonFunctions';
import login from './login';

const projectName = process.env.VUE_APP_PROJECTNAME;

const actions = {
  setUserData({ commit }, data) {
    commit('setUserData', data);
  },


  /** DBからユーザー情報を取得しstate更新 */
  update({ commit, state }) {
    const ls = cf.getLocalStorage(projectName);
    // localStorageが存在しない場合はスルー
    if (!ls) return;

    // TODO: user情報をDBから取得してアップデート

    if (state.login.isLogin && ls.jwt) {
      axios({
        method: 'GET',
        url: '/v1/user/get/detail',
        params: {
          id: state.id,
        },
      })
        .then((response) => {
          const user = response.data.data;
          commit('update', user);
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        });
    }
  },
};

const mutations = {
  setUserData(state, data) {
    const keys = Object.keys(data);
    keys.some((key) => {
      // passwordはstoreで保持しない
      if (key !== 'password') {
        state[key] = data[key];
      }
      return false;
    });
  },

  update(state, user) {
    const userKeys = Object.keys(user);
    const stateKeys = Object.keys(state);
    // 取得したuserの値をまわして
    userKeys.some((key) => {
      // キーが存在するstateを更新
      if (stateKeys.includes(key)) {
        // console.log(key);
        state[key] = user[key];
      }
      return false;
    });
  },
};

const state = {
  id: '',
};


export default {
  namespaced: true,
  actions,
  mutations,
  state,
  modules: {
    login,
  },
};
