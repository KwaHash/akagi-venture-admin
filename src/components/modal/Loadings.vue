<template>
  <transition name="fade" mode="out-in">
    <div class="modal loadings" v-if="isShow">
      <!-- loadingはbgクリックで閉じさせない -->
      <div class="modal__bg"></div>
      <!-- modalNameに応じて表示するコンポーネントを変化 -->
      <component v-bind:is="loadings.modalName" />
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';

// 個別モーダルコンポーネントの登録
// import modalLoadingBallClipRotate from './loadings/BallClipRotate.vue';
// import modalLoadingBallScaleRipple from './loadings/BallScaleRipple.vue';
import modalLoadingBallScaleRippleMultiple from './loadings/BallScaleRippleMultiple.vue';

export default {
  name: 'LoadingsModal',
  components: {
    // modalLoadingBallClipRotate,
    // modalLoadingBallScaleRipple,
    modalLoadingBallScaleRippleMultiple,
  },
  computed: {
    ...mapState('modal', ['loadings']),
    isShow() {
      return this.loadings.modalName !== '';
    },
  },
};
</script>
