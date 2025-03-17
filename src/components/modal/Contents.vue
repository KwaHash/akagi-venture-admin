<template>
  <transition name="fade" mode="out-in">
    <div class="modal contents" v-if="isShow">
      <div class="modal__bg" v-on:click="hideModal"></div>

      <div class="modal__content" v-bind:class="contents.modalName">
        <!-- modalNameに応じて表示するコンポーネントを変化 -->
        <component
          v-bind:is="contents.modalName"
          v-bind:data="contents.data" />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
// モーダルコンポーネントの登録
import EditUser from './contents/EditUser.vue';

export default {
  name: 'ContentsModal',
  components: {
    EditUser,
  },
  computed: {
    ...mapState('modal', ['contents']),
    isShow() {
      return this.contents.modalName !== '';
    },
  },
  methods: {
    hideModal(args = null) {
      this.$store.dispatch('modal/contents/hideModal', args, { root: true });
    },
  },
};
</script>
