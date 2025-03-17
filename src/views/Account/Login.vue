<template>
  <div class="px-5">
    <spacer :y="12"/>
    <h2 :class="$style.title">ログイン</h2>
    <spacer :y="4"/>
    <form
      v-on:submit="submit"
      :class="user.login.vibration ? $style.vibration : ''"
      autocomplete="off">
      <div :class="$style.form">
        <div :class="$style.input">
          <input
            id="mail"
            type="email"
            name="mail"
            placeholder="メールアドレス"
            v-model.trim="$v.mail.$model"
            v-bind:class="{ input_error: validationFlags.mail }"
            v-on:input="invalidsCheck('mail', $v.mail.$invalid)"
            >
          <span :class="$style.slideIn"/>
        </div>
        <p
          :class="$style.comment"
          v-if="$v.mail.$dirty
            && $v.mail.required.$invalid">メールアドレスを入力してください</p>
        <p
          :class="$style.comment"
          v-if="$v.mail.$dirty
            && $v.mail.email.$invalid">正しいメールアドレスの形式で入力してください</p>
        <spacer :y="2"/>
        <div :class="$style.input">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="パスワード"
            v-model.trim="$v.password.$model"
            v-bind:class="{ input_error: validationFlags.password }"
            v-on:input="invalidsCheck('password', $v.password.$invalid)"
            >
          <span :class="$style.slideIn"/>
        </div>
        <p
          :class="$style.comment"
          v-if="$v.password.$dirty
            && $v.password.required.$invalid">パスワードを入力してください</p>
        <spacer :y="2"/>
        <p
          :class="$style.message"
          v-if="user.login.isBanned && helper.master">パスワードを{{ helper.master.system.ban.count }}回間違えたため、{{ user.login.unbannedTime }}までログインが制限されています。<br>制限を解除したい場合は運営まで連絡してください。</p>
        <p
          :class="$style.comment"
          v-if="user.login.isFaild === 1 && !user.login.isBanned">入力されたメールアドレスは登録されていません</p>
        <p
          :class="$style.comment"
          v-if="user.login.isFaild === 2 && !user.login.isBanned">入力されたパスワードが間違っています</p>
        <spacer :y="4"/>
        <div :class="[$style.wrap, $style.pointer]">
          <button
            type="submit"
            class="btn btn-dark"

            v-bind:disabled="!submitFlag">ログイン</button>
        </div>
        <spacer :y="3"/>
        <div :class="$style.wrap">
          <div :class="$style.forgot">
            <router-link
              to="/forgot-password/">パスワードをお忘れですか？</router-link>
          </div>
        </div>
      </div>
    </form>
    <spacer :y="12"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import cf from '@/mixins/commonFunctions';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'Login',
  mixins: [cf],
  components: {
    Spacer,
  },
  data() {
    return {
      validationFlags: {
        mail: false,
        password: false,
      },
      invalids: {
        mail: true,
        password: true,
      },
      // 有効期限切れでリダイレクトされた
      isExpired: false,
    };
  },
  created() {
    console.log('test');
    this.axios({
      method: 'GET',
      url: '/v1/connection/database',
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response) console.log(error.response.data);
        else console.log(error);
      });

    if (this.$route.query
      && this.$route.query.expired) this.isExpired = true;
  },
  setup() {
    const mail = ref('');
    const password = ref('');

    const rules = {
      // メールは必須・email形式
      mail: { required, email },
      // パスワードは必須
      password: { required },
    };

    const $v = useVuelidate(rules, { mail, password });

    return { mail, password, $v };
  },
  computed: {
    ...mapState(['user', 'page', 'helper']),
    submitFlag() {
      // 無効フラグが全てfalseならばtrueを返却
      return !this.invalids.mail && !this.invalids.password;
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
        email: this.mail,
        password: this.password,
      };

      this.$store.dispatch('user/login/submit', data);
      this.$store.dispatch('user/update');
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
}
.message {
  font-size: 12px;
  text-align: center;
}
.forgot {
  font-size: 14px;
  text-decoration: underline;
  a {
    color: var(--orange-main);
  }
}
.pointer {
  cursor: pointer;
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
