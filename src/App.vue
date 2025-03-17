<template>
  <div class="wrapper">
    <GlobalHeader />
    <div class="contents">
      <router-view />
    </div>
    <GlobalFooter />
    <ContentsModal />
    <LoadingsModal />
    <MessagesModal />
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex';
import ContentsModal from '@/components/modal/Contents.vue';
import LoadingsModal from '@/components/modal/Loadings.vue';
import MessagesModal from '@/components/modal/Messages.vue';
import {
  GlobalHeader,
  GlobalFooter,
} from '@/components/layouts';

export default {
  name: 'App',
  components: {
    ContentsModal,
    LoadingsModal,
    MessagesModal,
    GlobalHeader,
    GlobalFooter,
  },
  computed: {
  },
  created() {
    // ログインチェック
    this.$store.dispatch('user/login/check');
    // backend共通マスターデータ取得
    this.$store.dispatch('helper/getMaster');
  },
  watch: {
  },
  methods: {
  },
};
</script>


<style lang="scss">
@use './assets/scss/_variables.scss';
@use './assets/scss/style.scss';
</style>
