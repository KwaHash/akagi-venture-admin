<template>
  <div class="px-5">
    <spacer :y="12"/>
    <h2 :class="$style.title">パスワード再発行</h2>
    <spacer :y="5"/>

    <div
      class="wrap-error"
      v-if="invalid">
      <p>アクティベートキーが無効です。<br>再度パスワード再設定リクエストを送信してください。</p>
      <p><router-link
        to="/forgot-password/"
        class="link">再設定リクエスト</router-link></p>
    </div>

    <form
      :class="$style.form"
      v-if="!invalid"
      autocomplete="off">
      <div
        :class="$style.input"
        v-if="!flag.sended && !flag.updated">
        <input
          id="password"
          type="password"
          name="password"
          placeholder="パスワード"
          v-model.trim="$v.password.$model"
          v-bind:class="{ input_error: validationFlags.password }"
          v-on:input="invalidsCheck('password', $v.password.$invalid)">
        <span :class="$style.slideIn"/>
      </div>

      <p
        :class="$style.comment"
        v-if="$v.password.$dirty && $v.password.minLength.$invalid">
        パスワードは8文字以上で設定してください</p>

      <Spacer
        v-if="!flag.sended && !flag.updated"
        :y="6"/>

      <div
        v-if="!flag.sended && !flag.updated">
        <button
          @click="submit"
          class="btn btn-dark"
          v-bind:disabled="!submitFlag">登録
        </button>
      </div>

      <p
        v-if="flag.sended
          && flag.expired
          && !flag.updated"
        :class="$style.comment">
        パスワード再設定の有効期限が切れています。再度<router-link to="/forgot-password/" class="link">こちら</router-link>からパスワード再設定リクエストをお送りください。</p>

      <p
        v-if="flag.sended
          && !flag.expired
          && !flag.updated"
        :class="$style.comment">
        パスワードアップデートのためのアクティベートキーが無効です。<br>
        再度<router-link to="/forgot-password/" class="link">こちら</router-link>
        からパスワード再設定リクエストをお送りください。</p>

      <p
        v-if="flag.sended
          && flag.updated"
        :class="$style.comment">
        パスワードを更新しました。<br>
        <router-link to="/login/?isResetPass=true" class="link">こちら</router-link>
        からログインしてください。</p>

    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import Spacer from '@/components/Spacer.vue';
import cf from '@/mixins/commonFunctions';

export default {
  name: 'reset-password',
  mixins: [cf],
  components: {
    Spacer,
  },
  data() {
    return {
      validationFlags: {
        password: false,
      },
      // 無効フラグ
      invalids: {
        password: true,
        minLength: true,
      },
      // パラメータなし等で無効
      invalid: true,
      activatekey: null,
      flag: {
        sended: false,
        updated: false,
        expired: false,
      },
    };
  },
  created() {
    // パラメータが含まれているか確認
    const query = this.$route.query;
    if (query.secret) {
      this.invalid = false;
      this.activatekey = query.secret;
    }
  },
  setup() {
    const password = ref('');

    const rules = {
      // パスワードは必須で8文字以上
      password: {
        required,
        minLength: minLength(8),
      },
    };

    const $v = useVuelidate(rules, { password });
    return { password, $v };
  },
  computed: {
    ...mapState(['user', 'page']),
    submitFlag() {
      // 無効フラグが全てfalseならばtrueを返却
      return !this.invalids.password && !this.flag.updated && !this.flag.expired;
    },
  },
  methods: {
    /** ローディング表示 */
    showLoading() {
      const args = { modalName: 'modalLoadingBallClipRotate' };
      this.$store.dispatch('modal/loadings/showModal', args, { root: true });
    },

    /** ローディング非表示 */
    hideLoading() {
      this.$store.dispatch('modal/loadings/hideModal', null, { root: true });
    },

    invalidsCheck(name, bool) {
      this.invalids[name] = bool;
    },
    submit(e) {
      e.preventDefault();
      this.showLoading();
      // validateチェックは入力時に行われてる
      const data = {
        password: this.password,
        activatekey: this.activatekey,
      };

      this.axios({
        method: 'POST',
        url: '/v1/user/resetPassword',
        data,
      })
        .then((response) => {
          const resData = response.data;
          if (resData.updated) this.flag.updated = true;
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            if (error.response.data.expired) this.flag.expired = true;
          } else console.log(error);
        })
        .finally(() => {
          this.flag.sended = true;
          this.hideLoading();
        });
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  display: flex;
  justify-content: center;
}
.logo {
  margin: 0 auto;
  width: 50%;
  max-width: 300px;
}
.title {
  text-align: center;
  color: var(--orange-main);
}
.form {
  text-align: center;
}
.input {
  margin: 0 auto;
  width: 400px;
  max-width: 100%;
  position: relative;
  input {
    width: 100%;
    padding: 13px;
    border: none;
    background-color: white;
    outline: none;
    border-bottom: 1px solid var(--gray);

    &:focus + .slideIn {
      display: block;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: rgba(#e2e2e2, .4);
      mix-blend-mode: multiply;
      position: absolute;
      animation: split .3s;
    }

    @keyframes split {
      0% {
        width: 0;
      }
      100% {
        width: 100%;
      }
    }
  }
}
.comment {
  font-size: 12px;
  color: var(--pink);
}
.message {
  font-size: 12px;
  text-align: center;
}
.btn {
  display: inline-block;
  border-radius: 22px;
  border: none;
  background-color: #666;
  font-weight: bold;
  color: #fff;
  appearance: none;
  padding: 8px 25px;
  font-size: 16px;
}
.forgot {
  font-size: 14px;
  text-decoration: underline;
  a {
    color: var(--orange-main);
  }
}
// ログイン失敗時
.vibration {
  animation: vibration .1s  infinite;
}
@keyframes vibration {
  0% {transform: translate(0px, 0px) rotateZ(0deg)}
  25% {transform: translate(2px, 2px) rotateZ(1deg)}
  50% {transform: translate(0px, 2px) rotateZ(0deg)}
  75% {transform: translate(2px, 0px) rotateZ(-1deg)}
  100% {transform: translate(0px, 0px) rotateZ(0deg)}
}
</style>
