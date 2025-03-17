<template>
  <div :class="$style.wrap" class="d-flex align-items-center">
    <div class="d-flex justify-content-between align-items-center" :class="$style.content">
      <component
        :is="isLink ? 'router-link' : 'div'"
        :to="isLink ? '/' : ''"
        :class="$style.logo"
        >AKAGI & VENTURE<br>PROJECT
      </component>
      <div class="d-flex align-items-center">
        <div v-if="!user.login.isLogin">
          <router-link
            to="/login/"
            class="btn btn-outline-light">ログイン</router-link>
        </div>
        <div v-if="user.login.isLogin">
          <div
            class="btn btn-outline-light"
            @click="logout">ログアウト</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'GlobalHeader',
  components: {
  },
  data() {
    return {
      // ログイン不要ページ（配下含む）
      notRequiredLoginPages: [
        'signup',
        'login',
        'forgot-password',
        'reset-password',
      ],
    };
  },
  computed: {
    ...mapState(['user', 'page', 'helper']),
    isLink() {
      return !this.notRequiredLoginPages.some((p) => this.$route.path.includes(p));
    },
  },
  created() {
  },
  methods: {
    logout() {
      this.$store.dispatch('user/login/logout', null, { root: true });
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  background-color: var(--navy);
  position: fixed;
  top: 0;
  left: 0;
  height: var(--header-height);
  width: 100%;
  z-index: 50;
}
.content {
  width: 100%;
  padding: 0 24px;
}
.logo {
  font-size: 16px;
  color: white;
  margin: 0;
  text-decoration: none;
}
</style>
