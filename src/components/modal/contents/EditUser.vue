<template>
  <div>
    <h1 class="fs-3 fw-bold mb-4">管理者一覧</h1>
    <ul>
      <li
        class="mb-4"
        v-for="item in items"
        :key="item">
        <p class="fw-bold form-label mb-2">{{ item.label }}</p>

        <div v-if="item.type === 'text'">
          <input
            type="text"
            class="form-control"
            v-model="item.value">
        </div>

        <div v-if="item.type === 'select'">
          <select
            class="form-control"
            :name="item.name"
            :id="item.id"
            v-model="item.value">
            <option :value="0" :selected="item.value === 0">選択してください</option>
            <option
              v-for="opt in item.options"
              :key="opt.id"
              :value="opt.id"
              :selected="item.value === opt.id">{{ opt.label }}</option>
          </select>
        </div>
      </li>
    </ul>
    <div class="btn-list horizontal mt-5">
      <button
        class="btn btn-primary me-2"
        :disabled="!submitFlag"
        v-on:click="updateUser">保存</button>
      <button
        class="btn btn-outline-secondary me-2"
        v-on:click="hideModal">キャンセル</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    data: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      items: [
        {
          name: 'username',
          label: '名前',
          type: 'text',
          value: null,
        },
        {
          name: 'shop',
          label: '店舗',
          type: 'select',
          options: [],
          value: 0,
        },
      ],
    };
  },
  created() {
    this.items.forEach((row) => {
      if (row.name === 'shop') {
        row.value = this.data.shops && this.data.shops[0] ? this.data.shops[0].id : 0;
      } else {
        row.value = this.data[row.name];
      }
    });
    this.getShops();
  },
  computed: {
    ...mapState(['helper']),
    submitFlag() {
      return !this.items.some((item) => [0, null, ''].includes(item.value));
    },
  },
  methods: {
    hideModal(payload) {
      this.$store.dispatch('modal/contents/hideModal', payload === 'update' ? payload : null, { root: true });
    },

    getShops() {
      const params = {};
      this.axios({
        method: 'GET',
        url: 'v1/shop/get/list',
        params,
      })
        .then((response) => {
          const res = response.data;
          this.items.forEach((item) => {
            if (item.name === 'shop') item.options = res.list.data;
          });
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        });
    },

    updateUser(e) {
      e.preventDefault();

      const data = {
        id: this.data.id,
        flag: 1,
      };

      this.items.forEach((item) => {
        data[item.name] = item.value;
      });

      this.axios({
        method: 'POST',
        url: '/v1/user/update',
        data,
      })
        .then(() => {
          alert('ユーザー情報を更新しました。');
          this.hideModal('update');
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
          this.hideLoading();
        });
    },
  },
};
</script>
