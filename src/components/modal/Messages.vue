<template>
  <transition name="fade" mode="out-in">
    <div class="modal messages" v-if="isShow">
      <div class="modal__bg" v-on:click="hideModal"></div>

      <div class="modal__content" v-bind:class="messages.modalName">
        <!-- modalNameに応じて表示するコンポーネントを変化 -->
        <component
          v-bind:is="messages.modalName"
          v-bind:data="messages.data" />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
// モーダルコンポーネントの登録

export default {
  name: 'MessagesModal',
  components: {},
  computed: {
    ...mapState('modal', ['messages']),
    isShow() {
      return this.messages.modalName !== '';
    },
  },
  methods: {
    hideModal(args = null) {
      this.$store.dispatch('modal/messages/hideModal', args, { root: true });
    },
  },
};
</script>
