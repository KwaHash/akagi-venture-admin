<template>
  <div :class="$style.wrap">
    <div :class="$style.loader_simple"/>
  </div>
</template>

<script>
export default {
  name: 'modalLoadingBallScaleRippleMultiple',
};
</script>

<style lang="scss" module>
.wrap {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  z-index: 890;
  height: calc(100vh - var(--header-height));
}
.loader_simple {
  width: 2em;
  height: 2em;
  animation: rotation 1s infinite linear;
  border: 2px solid rgba(black, .1);
  border-top-color: #0c183d;
  border-radius: 50%;
  position: absolute;
  top: 0; bottom: 0;
  left: 0; right: 0;
  margin: auto;
  z-index: 900;
}
@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}
</style>
