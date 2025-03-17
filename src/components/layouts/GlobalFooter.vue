<template>
  <footer>
    <p :class="$style.logo">AKAGI & VENTURE<br>PROJECT</p>
  </footer>
</template>

<script>

export default {
  name: 'GlobalFooter',
  components: {
  },
  computed: {
  },
  created() {
  },
  methods: {
  },
};
</script>

<style lang="scss" module>
footer {
  background-color: var(--gray);
  width: 100%;
  position: absolute;
  bottom: 0;
  height: var(--footer-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  text-align: center;
  margin: 0;
  color: #fff;
}
</style>
