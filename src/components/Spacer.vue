<template>
  <div :class="$style.spacer" :style="style" />
</template>

<script>
export default {
  name: 'Spacer',
  props: {
    y: {
      type: Number,
      default: 1,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
    x: {
      type: Number,
      default: 1,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
    mdX: {
      type: Number,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
    mdY: {
      type: Number,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
    smX: {
      type: Number,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
    smY: {
      type: Number,
      validator: (value) => Number.isInteger((value * 10) % 5), // 0.5刻みまで許容
    },
  },
  computed: {
    style() {
      return {
        '--width': `calc(var(--s) * ${this.x})`,
        '--height': `calc(var(--s) * ${this.y})`,
        '--md-width': `calc(var(--s) * ${this.calcMdX})`,
        '--md-height': `calc(var(--s) * ${this.calcMdY})`,
        '--sm-width': `calc(var(--s) * ${this.calcSmX})`,
        '--sm-height': `calc(var(--s) * ${this.calcSmY})`,
      };
    },
    calcMdX() {
      if (this.isNumber(this.mdX)) return this.mdX;
      return this.x;
    },
    calcMdY() {
      if (this.isNumber(this.mdY)) return this.mdY;
      return this.y;
    },
    calcSmX() {
      if (this.isNumber(this.smX)) return this.smX;
      return this.calcMdX;
    },
    calcSmY() {
      if (this.isNumber(this.smY)) return this.smY;
      return this.calcMdY;
    },
  },
  methods: {
    isNumber(value) {
      return ((typeof value === 'number') && (isFinite(value)));
    },
  },
};
</script>

<style lang="scss" module>
.spacer {
  flex-grow: 0;
  flex-shrink: 0;
  display: block;
  width: var(--width);
  height: var(--height);

  @media (max-width: 1024px) {
    width: var(--md-width);
    height: var(--md-height);
  }

  @media (max-width: 768px) {
    width: var(--sm-width);
    height: var(--sm-height);
  }
}
</style>
