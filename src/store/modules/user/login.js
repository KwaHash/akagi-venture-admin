/**
* ログイン管理
*/

import axios from '@/plugins/axios';
import router from '@/router';
import cf from '@/mixins/commonFunctions';

const projectName = process.env.VUE_APP_PROJECTNAME;

// 閲覧にログインが不要のページ名（配下含め）
// ※追加時GlobalHeaderも要変更
const notRequiredLoginPageNames = [
  'signup',
  'login',
  'forgot-password',
  'reset-password',
  'login',
];


const actions = {
  /** state.isLoginの変更 */
  changeLoginStatus({ commit }, bool) {
    commit('changeLoginStatus', bool);
  },


  /** ログインしているかのチェック */
  check({ commit, dispatch, state }) {
    // cf.deleteLocalStorage(projectName);
    const ls = cf.getLocalStorage(projectName);
    // 現在の環境チェック
    dispatch('helper/checkEnv', null, { root: true });

    const currentPath = router.options.history.location;

    // localStorageが存在しない（未サインナップ）
    if (!ls || !ls.auth) {
      commit('changeCheckedStatus', true);
      dispatch('user/setUserData', { hasntToken: true }, { root: true });

      let isRedirect = true; // 編集後にtrueに戻す
      notRequiredLoginPageNames.some((pageName) => {
        if (currentPath.includes(pageName)) { isRedirect = false; return true; }
        return false;
      });

      // ログインページへリダイレクト
      if (isRedirect) {
        alert('本ページを閲覧するにはログインしている必要があります。\nログインページへリダイレクトします。');
        const current = router.options.history;
        const ref = { path: current.location };
        // ログイン後に元いたページへ戻すためpathとqueryを保持しておく
        cf.saveLocalStorage({ loginRef: JSON.stringify(ref) }, projectName);
        dispatch('redirect2Login');
      }

      return;
    }

    // ログインstateがなく、かつauthがあれば認証APIを叩く
    if (!state.isLogin && ls.auth) {
      dispatch('authCheck', {
        type: 'check',
        auth: ls.auth,
      });
    }
  },


  /**
   * ログインページのsubmit押下
   * API通信してIDとPASSをpost
   * 認証に成功したらtokenをlocalStorageへ保存
   * @param obj data
   *   email:    str
   *   password: str
   */
  submit({ commit, dispatch }, data) {
    axios({
      method: 'post',
      url: '/v1/auth/login',
      data,
    })
      .then((response) => {
        const res = response.data;
        const auth = {
          token: `${res.token.type} ${res.token.token}`,
          expires_at: res.token.expires_at,
        };
        if (res && res.token) {
          // cf.deleteLocalStorage(projectName);
          // tokenをlocalStorageに保存
          cf.saveLocalStorage({
            auth,
          }, projectName);

          // 取得したtokenを元にログインチェック
          dispatch('authCheck', {
            type: 'login',
            isRegist: data.isRegist,
            auth,
          });
        }
      })
      .catch((error) => {
        dispatch('loginFailed');
        if (error.response) {
          const errRes = error.response.data;
          console.log(errRes);
          // ログイン失敗時にエラー内容を表示 アカウントなし：1
          // パスワード違い：2
          if (errRes.message.includes('E_USER_NOT_FOUND')) {
            commit('changeLoginErrorStatus', 1);
          } else if (errRes.message.includes('E_INVALID_AUTH_PASSWORD')) {
            commit('changeLoginErrorStatus', 2);
          }

          if (errRes.isBanned) {
            commit('changeBannedStatus', { isBanned: errRes.isBanned, unbannedTime: errRes.unbannedTime });
          } else if (errRes.failedStatus) {
            commit('changeBannedStatus', { isBanned: errRes.failedStatus.isBanned, unbannedTime: errRes.failedStatus.unbannedTime });
          } else {
            commit('changeBannedStatus', { isBanned: false, unbannedTime: null });
          }
        } else console.log(error);
      });
  },


  /**
   * auth情報を使ってログインチェックし
   * 取得したユーザーデータをstateへ格納
   * @param obj data
   *   auth: obj
   *   type: 'check' || 'login'
   * logincheckではlocalstorageから
   * loginsubmitでは取得したtokenをdataに格納して渡す
   */
  authCheck({ commit, dispatch }, data) {
    const ls = cf.getLocalStorage(projectName);
    const Authorization = `${ls.auth.token}`;

    axios({
      method: 'POST',
      url: '/v1/auth/check',
      headers: { Authorization },
    })
      .then((response) => {
        // user.flagが1以外はログイン無効
        const user = response.data.user;
        if (user.flag !== 1) {
          // ログイン時には失敗の挙動
          if (data.type === 'login') dispatch('loginFailed');
          cf.deleteLocalStorage(projectName, 'auth');
          commit('changeLoginStatus', false);
          return;
        }
        if (user.role && user.role.role < 10) {
          if (ls && ls.auth) {
            dispatch('logout');
          }
          return alert('アクセス権限がありません');
        }

        // authcheck後にstateを更新
        commit('changeLoginStatus', true);
        // ユーザー情報をstate.userにセット（user/index.js）
        dispatch('user/setUserData', user, { root: true });
        // システムマスターの判別
        dispatch('helper/checkSystemMaster', null, { root: true });
        // ログイン制限state解除
        commit('changeBannedStatus', { isBanned: false, unbannedTime: null });

        // ログイン時
        if (data.type === 'login') {
          // リファラの有無でリダイレクト先が変わる
          if (ls && ls.loginRef) {
            const ref = JSON.parse(ls.loginRef);
            const pushParams = { ...ref };
            if (ls.query) pushParams.query = ls.query;
            router.push(pushParams);
          } else {
            router.push({ path: '/' });
          }
        }
      })
      .catch((error) => {
        if (error.response) console.log(error.response.data);
        else console.log(error);

        if (data.type === 'check') {
          // ログインチェック時
          const errors = error.response.data.errors;

          // 期限切れ
          if (errors[0].message.includes('E_UNAUTHORIZED_ACCESS')) {
            if (ls.auth) { // ログイン画面へリダイレクト
              alert('ログイン有効期限が切れています。\nログイン画面へリダイレクトします');
              const current = router.options.history;
              const ref = { path: current.location };
              // ログイン後に元いたページへ戻すためpathとqueryを保持しておく
              cf.saveLocalStorage({ loginRef: JSON.stringify(ref) }, projectName);
              dispatch('redirect2Login');
              cf.deleteLocalStorage(projectName, 'auth');
            }
          } else {
            // DBとの接続に失敗
            alert('データの取得に失敗しました。リロードをお試しください');
          }
        } else if (data.type === 'login') {
          // ログイン直後
          dispatch('loginFailed');
          commit('changeLoginStatus', false);
          cf.deleteLocalStorage(projectName, 'auth');
          alert('ログインで問題が発生しました\nお手数ですが管理者へお知らせください');
        }
      })
      .finally(() => {
        commit('changeCheckedStatus', true);
      });
  },


  /** ログイン失敗 */
  loginFailed({ commit }) {
    commit('changeVibrationStatus', true);
    setTimeout(() => { commit('changeVibrationStatus', false); }, 500);
  },


  /** 有効期限切れ時のログイン画面リダイレクト */
  redirect2Login() {
    router.push({ path: '/login/' });
  },


  /** トップへリダイレクト */
  redirect2Top() {
    router.push({ path: '/' });
  },


  /** ログアウト */
  logout() {
    const ls = cf.getLocalStorage(projectName);
    if (ls.auth.token) {
      axios({
        method: 'post',
        url: '/v1/auth/logout',
        headers: {
          Authorization: ls.auth.token,
        },
      })
        .then(() => {
          // localStorageの更新
          cf.deleteLocalStorage(projectName, 'loginRef');
          cf.deleteLocalStorage(projectName, 'auth');
          // ログインページへリダイレクト・全storeリセットのため強制リロード
          router.push({ path: '/login/' });
          setTimeout(() => { router.go(router.currentRoute.path); }, 500);
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        });
    }
  },
};

const mutations = {
  /** チェック済みステート */
  changeCheckedStatus(state, bool) {
    state.isChecked = bool;
  },

  /** ログインステート */
  changeLoginStatus(state, bool) {
    state.isLogin = bool;
  },

  /** ログイン失敗時のバイブフラグステート */
  changeVibrationStatus(state, bool) {
    state.vibration = bool;
  },

  /** ログイン制限時のフラグ・日時ステート */
  changeBannedStatus(state, { isBanned: bool, unbannedTime: datetime }) {
    state.isBanned = bool;
    state.unbannedTime = datetime;
  },

  /** ログイン失敗時のエラー内容ステート */
  changeLoginErrorStatus(state, number) {
    if (number === 0) {
      state.isFaild = 0;
    } else {
      state.isFaild = number;
    }
  },
};

const state = {
  isChecked: false,
  isLogin: false,
  vibration: false,
  isBanned: false,
  unbannedTime: null,
  isFaild: 0,
};


export default {
  namespaced: true,
  actions,
  mutations,
  state,
};
