<template>
  <div class="px-5">
    <spacer :y="12" />
    <h2 :class="$style.title">パスワード設定</h2>
    <spacer :y="4" />

    <div :class="$style.message" v-if="invalid">
      <p>
        アクティベートキーが無効です。<br />
        メールアドレス登録時のメールに記載されたURLから再度アクセスするか、ログインをお試しください。
      </p>
    </div>

    <form
      class="form_login form"
      autocomplete="off"
      v-if="!invalid">

      <div
        v-if="!flag.sended"
        :class="$style.form">
        <div :class="$style.input">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="password"
            v-model.trim="$v.password.$model"
            v-bind:class="{ input_error: validationFlags.password }"
            v-on:input="invalidsCheck('password', $v.password.$invalid)">
          <span class="slide-in"></span>
        </div>
        <p
          :class="$style.comment"
          v-if="$v.password.$dirty && $v.password.required.$invalid">
          パスワードを入力してください</p>
        <p
          :class="$style.comment"
          v-if="$v.password.$dirty && $v.password.minLength.$invalid">
          パスワードは8文字以上で設定してください</p>

        <spacer :y="4" />
        <div
          v-if="!flag.sended">
          <button
            class="btn btn-dark"
            @click="submit"
            v-bind:disabled="!submitFlag">
            確定</button>
        </div>

      </div>
      <div
        v-if="flag.sended && flag.registed">
        <p :class="$style.message">
          パスワードを登録しました。<br>
          <router-link :to="'/login/?isRegist=true'">ログインページ</router-link>よりログインしてください。
        </p>
      </div>
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
  name: 'SignupPassword',
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
        registed: false,
      },
    };
  },
  created() {
    // パラメータが含まれているか確認
    const query = this.$route.query;
    if (query.activate) {
      this.invalid = false;
      this.activatekey = query.activate;
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
      return !this.invalids.password;
    },
  },
  methods: {
    /** 無効フラグの更新 */
    invalidsCheck(name, bool) {
      this.invalids[name] = bool;
    },

    /** サブミット */
    submit(e) {
      e.preventDefault();

      // validateチェックは入力時に行われてる
      const data = {
        flag: 1,
        password: this.password,
        activatekey: this.activatekey,
      };

      this.axios({
        method: 'POST',
        url: '/v1/user/create/password',
        data,
      })
        .then((response) => {
          const resData = response.data;
          if (resData.registed) this.flag.registed = true;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
          this.invalid = true;
        })
        .finally(() => {
          this.flag.sended = true;
        });
    },
  },
};
</script>

<style lang="scss" module>
.title {
  text-align: center;
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
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;

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
  margin-top: 8px;
}
.message {
  text-align: center;
}
</style>
