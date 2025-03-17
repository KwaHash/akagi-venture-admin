<template>
  <div class="home container">
    <Spacer :y="4"/>
    <ul class="btn btn-list vertical">
      <li v-for="item in items" :key="item.name">
        <router-link
          class="btn btn-primary"
          :to="item.path">{{ item.label }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'point',
  components: {
    Spacer,
  },
  data() {
    return {
      items: [
        {
          label: 'ポイント付与',
          name: 'addPoint',
          path: '/point/add/',
          accept: [11, 21],
        },
      ],
    };
  },
};
</script>
