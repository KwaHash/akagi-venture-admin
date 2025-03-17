<template>
  <div :class="$style.wrap">
    <div :class="$style.container">
      <div :class="[
        $style.circle,
        $style[size]
      ]" />
      <p
        v-if="size === 'md'"
        :class="$style.loading">Loading</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md'].includes(value),
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.container {
  position: relative;
  display: inline-block;
  padding: 30px;
}
.circle {
  box-sizing: border-box;
  border-radius: 100%;
  animation: spin 1s infinite linear;

  &.md {
    border: 10px solid #17223b;
    border-top-color: rgba(0, 0, 0, 0.5);
    width: 80px;
    height: 80px;
  }

  &.sm {
    border: 3px solid #17223b;
    border-top-color: rgba(0, 0, 0, 0.5);
    width: 30px;
    height: 30px;
  }
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
