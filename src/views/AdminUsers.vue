<template>
  <div class="home container">
    <h1 class="page_title">管理者一覧</h1>
    <Spacer :y="3" />
    <div class="row">
      <div class="col-9">
        <Loading
          v-if="flg.isLoading"
          size="sm" />
        <ul class="list-group"
          v-if="!flg.isLoading">
          <li
            class="list-group-item"
            v-for="row in adminUsers"
            :key="row.id">
            <div
              class="user-list"
              v-if="editId !== row.id">
              <div class="user-list_text d-flex">
                <div>
                  {{ row.username || 'ユーザーネーム未設定' }}（{{ row.email }}）
                </div>
                <div
                  class="item_list_options"
                  v-if="!editId">
                  <div
                    class="option pointer"
                    v-on:click="startModal($event, row)"><i>&#x270e;</i></div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="col-3">
        <div class="card">
            <p class="card-header fw-bold">管理ユーザー登録</p>
            <div class="card-body">
              <div>
                <p class="form-label">メールアドレス</p>
                <input
                  id="mail"
                  class="form-control form-control-sm"
                  type="email"
                  name="mail"
                  v-model.trim="$v.mail.$model"
                  v-bind:class="{ input_error: validationFlags.mail }"
                  v-on:input="invalidsCheck('mail', $v.mail.$invalid)">
                <p
                  class="form-label red mt-1"
                  v-if="$v.mail.$dirty
                    && $v.mail.email.$invalid">
                    正しいメールアドレスの形式で入力してください
                </p>
              </div>

              <div class="mt-3">
                <p class="form-label">名前</p>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  v-model="username">
              </div>

              <div class="mt-3">
                <p class="form-label">店舗</p>
                <select
                  class="form-control form-control-sm"
                  name="shop"
                  id="shop"
                  v-model="shopId">
                  <option :value="0">選択してください</option>
                  <option
                    :value="shop.id"
                    v-for="shop in shops"
                    :key="shop.id">{{ shop.label }}</option>
                </select>
              </div>

              <div class="mt-4 text-center">
                <button
                  class="btn btn-primary btn-sm"
                  @click="submit($event, 'create')"
                  v-bind:disabled="!submitFlag">
                送信</button>
              </div>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import Loading from '@/components/parts/Loading.vue';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'admins-users',
  components: {
    Loading,
    Spacer,
  },
  data() {
    return {
      flg: {
        exists: false,
        regist: false,
        error: false,
        isLoading: true,
      },
      adminUsers: [],
      shops: [],
      username: null,
      shopId: 0,
      validationFlags: {
        mail: false,
      },
      invalids: {
        mail: true,
      },
    };
  },
  created() {
    if (this.user.email) {
      this.checkRole();
    } else {
      this.$store.subscribe((mutation) => {
        if (mutation.type === 'user/setUserData') {
          this.checkRole();
        }
      });
    }
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
  mounted() {
    // storeを監視してユーザー編集後getする
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'modal/contents/parentUpdate') {
        this.getUsers();
      }
    });
    this.getShops();
  },
  computed: {
    ...mapState(['user', 'helper']),
    submitFlag() {
      let flag = true;
      if (this.invalids.mail) flag = false; // メールアドレスが正しく入力されているか
      if (!this.username || this.username === '') flag = false;
      if (!this.shopId) flag = false;
      // 無効フラグが全てfalseならばtrueを返却
      return flag;
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

    checkRole() {
      if (this.user.role.role < 10) {
        alert('アクセス権限がありません。トップページへリダイレクトします。');
        this.$router.push('/');
      }
      this.getUsers();
    },

    getUsers() {
      this.flg.isLoading = true;
      const params = {
        role: [11],
      };
      if (this.user.role && this.user.role.role === 21) params.role.push(21);
      this.axios({
        method: 'GET',
        url: '/v1/user/get/list',
        params,
      })
        .then((response) => {
          const res = response.data;
          this.adminUsers = res.list.data;
        })
        .catch((error) => {
          if (error.message) console.log(error.message);
          else console.log(error);
        })
        .finally(() => {
          this.flg.isLoading = false;
        });
    },

    getShops() {
      const params = {};
      this.axios({
        method: 'GET',
        url: 'v1/shop/get/list',
        params,
      })
        .then((response) => {
          const res = response.data;
          this.shops = res.list.data;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        });
    },

    /** 無効フラグの更新 */
    invalidsCheck(name, bool) {
      this.invalids[name] = bool;
    },

    /** role更新 */
    updateRole(e, type) {
      if (type === 'register') {
        this.selectedRole = Number(e.target.value);
      } else {
        this.updateItems[2].value = Number(e.target.value);
      }
    },

    /** サブミット */
    submit(e) {
      e.preventDefault();

      this.showLoading();

      const data = {
        flag: 10,
        email: this.mail,
        username: this.username,
        role: 11,
        shop: this.shopId,
      };

      this.axios({
        method: 'POST',
        url: '/v1/user/create',
        data,
      })
        .then((response) => {
          const res = response.data;
          if (res.exists) {
            // 登録済み
            alert('このメールアドレスは登録済みです。');
            return this.hideLoading();
          }
          alert('ご入力いただいたメールアドレスにメールを送信しました。\nメールに記載されているURLからパスワードを登録してください。');
          // 各値初期化
          this.mail = null;
          this.username = null;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        })
        .finally(() => {
          this.hideLoading();
        });
    },

    startModal(e, user) {
      e.stopPropagation();
      const args = {
        modalName: 'edit-user',
        data: user,
      };
      this.$store.dispatch('modal/contents/showModal', args, { root: true });
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  display: flex;
  justify-content: center;
}

.title {
  text-align: center;
  color: var(--orange-main);
}

.form {
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

.message {
  font-size: 12px;
  text-align: center;
}

.input {
  margin: 0 auto;
  width: 400px;
  max-width: 100%;
  input {
    width: 100%;
    padding: 13px;
    border-radius: 8px;
    border: none;
    background-color: var(--gray-sub);
    outline: none;
  }
}
</style>
