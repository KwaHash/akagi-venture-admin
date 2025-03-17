<template>
  <div class="home container">
    <Spacer :y="4"/>
    <ul class="btn btn-list vertical">
      <li v-for="item in adjustedItems" :key="item.name">
        <router-link
          class="btn btn-primary"
          :to="item.path">{{ item.label }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'Home',
  components: {
    Spacer,
  },
  data() {
    return {
      items: [
        {
          label: 'ポイント',
          name: 'point',
          path: '/point/',
          accept: [11, 21],
        },
        {
          label: '記事投稿・編集',
          name: 'post',
          path: '/post/',
          accept: [11, 21],
        },
        {
          label: '店舗一覧',
          name: 'shop',
          path: '/shop/',
          accept: [11, 21],
        },
        {
          label: '管理者管理',
          name: 'admin-users',
          path: '/admin-users/',
          accept: [11, 21],
        },
      ],
    };
  },
  computed: {
    ...mapState(['user', 'page', 'helper']),
    // roleによって表示項目調整
    adjustedItems() {
      const arr = [];
      if (this.user && this.user.role) {
        this.items.forEach((item) => {
          if (item.accept.includes(this.user.role.role)) arr.push(item);
        });
      }
      return arr;
    },
  },
  methods: {
    /** ログアウト */
    logout(e) {
      e.preventDefault();
      this.$store.dispatch('user/login/logout');
    },
  },
};
</script>


<style lang="scss">
</style>
