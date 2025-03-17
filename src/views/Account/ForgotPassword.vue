<template>
  <div class="px-5">
    <spacer :y="12"/>
    <h2 :class="$style.title">パスワードリセット</h2>
    <spacer :y="5"/>
    <form autocomplete="off">
      <div :class="$style.form">
        <p
          v-if="!flag.sended"
          :class="$style.comment">登録しているメールアドレスを入力してください。</p>
        <Spacer
          v-if="!flag.sended"
          :y="5"/>
        <div :class="$style.input">
          <input
            id="mail"
            class=""
            type="email"
            name="mail"
            placeholder="メールアドレス"
            v-bind:class="{ input_error: validationFlags.mail }"
            v-model.trim="$v.mail.$model"
            v-bind:disabled="flag.sended && flag.updated"
            v-on:input="invalidsCheck('mail', $v.mail.$invalid)">
          <span :class="$style.slideIn"></span>
        </div>
        <p
          :class="$style.comment"
          v-if="$v.mail.$dirty && $v.mail.email.$invalid">
          正しいメールアドレスの形式で入力してください</p>

        <Spacer
          :y="4"
          v-if="flag.sended && flag.updated"/>
        <p
          :class="$style.comment"
          v-if="flag.sended && flag.updated">
          ご登録のメールアドレスへパスワードリセット用のメールを送信しました。<br>メールに記載されているURLからパスワードのリセットを行ってください。</p>
      </div>

      <Spacer :y="6"/>

      <div
        :class="$style.wrap"
        v-if="!flag.updated">
        <button
          @click="submit"
          class="btn btn-dark"
          v-bind:disabled="!submitFlag">送信
        </button>
      </div>

    </form>
    <Spacer :y="4"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import Spacer from '@/components/Spacer.vue';
import cf from '@/mixins/commonFunctions';

export default {
  name: 'forgot-password',
  mixins: [cf],
  components: {
    Spacer,
  },
  data() {
    return {
      validationFlags: {
        mail: false,
      },
      invalids: {
        mail: true,
      },
      flag: {
        sended: false,
        updated: false,
      },
    };
  },
  setup() {
    const mail = ref('');

    const rules = {
      // メールは必須・email形式
      mail: { required, email },
    };

    const $v = useVuelidate(rules, { mail });

    return { mail, $v };
  },
  computed: {
    ...mapState(['user', 'page', 'modal']),
    submitFlag() {
      // 無効フラグが全てfalseならばtrueを返却
      return !this.invalids.mail && !(this.flag.sended && this.flag.updated);
    },
  },
  methods: {
    /** ローディング表示 */
    showLoading() {
      const args = { modalName: 'modalLoadingBallScaleRippleMultiple' };
      this.$store.dispatch('modal/loadings/showModal', args, { root: true });
    },

    /** ローディング非表示 */
    hideLoading() {
      this.$store.dispatch('modal/loadings/hideModal', null, { root: true });
    },

    /** 無効フラグの更新 */
    invalidsCheck(name, bool) {
      this.invalids[name] = bool;
    },

    /** バイブレーションオン */
    vibration() {
      this.$store.dispatch('user/login/loginFailed');
    },

    /** サブミット */
    submit(e) {
      e.preventDefault();
      this.showLoading();
      const data = {
        email: this.mail,
        type: 'admin',
      };

      this.axios({
        method: 'POST',
        url: '/v1/user/forgotPassword',
        data,
      })
        .then((response) => {
          const resData = response.data;
          if (resData.updated) this.flag.updated = true;
        })
        .catch((error) => {
          this.vibration();
          if (error.response) console.log(error.response.data);
          else console.log(error);
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
