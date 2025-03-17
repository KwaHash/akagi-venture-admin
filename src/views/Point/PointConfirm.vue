<template>
  <div class="container container-xs">
    <h1 class="page_title center">ポイント承認</h1>
    <Spacer :y="6"/>
    <div v-if="!flag.updated && flag.validURL">
      <div v-if="!flag.edit" :class="$style.wrap">
        <p :class="$style.shop" v-if="selectedShop">{{ selectedShop.label }}</p>
        <div>
          <p
            :class="$style.edit"
            @click="flag.edit = true">変更する</p>
        </div>
      </div>
      <div v-if="flag.edit">
        <select
          class="form-control"
          @change="changeShop">
          <option
            v-for="shop in shops"
            :key="shop.id"
            :value="shop.id"
            :selected="shop.id === shopId">{{ shop.label }}</option>
        </select>
      </div>
      <Spacer :y="3"/>
      <div>
        <div :class="$style.info">
          <div :class="$style.label">利用ポイント数</div>
          <p :class="$style.point">{{ detail.amount }}</p>
        </div>
      </div>
      <Spacer :y="4"/>
      <ul class="btn-list horizontal center">
        <li>
          <div
            @click="updatePoint"
            class="btn btn-primary">承認する</div>
        </li>
      </ul>
    </div>

    <div
      v-if="flag.updated"
      :class="$style.updated">
      <p>ポイント利用登録が完了しました！</p>
      <p>{{ selectedShop.label }}：{{ detail.amount }}ポイント</p>
    </div>

    <div
      v-if="flag.loaded && !flag.validURL">
      <p :class="$style.center">無効なURLです</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'point-confirm',
  components: {
    Spacer,
  },
  data() {
    return {
      flag: {
        updated: false,
        edit: false,
        validURL: false,
        loaded: false,
      },
      detail: null,
      shopId: null,
      shops: [],
    };
  },
  created() {
    this.getShops();
    this.getDetail();
  },
  computed: {
    selectedShop() {
      return this.shops.find((s) => s.id === this.shopId);
    },
  },
  methods: {
    getShops() {
      const params = {};
      this.axios({
        method: 'GET',
        url: 'v1/shop/get/list',
        params,
      })
        .then((response) => {
          const res = response.data;
          this.shops = res.list.data;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        })
        .finally(() => {
          this.flag.loader = false;
        });
    },
    getDetail() {
      this.flag.loaded = false;
      this.flag.validURL = false;
      const params = {
        activatekey: this.$route.query.activatekey,
        flags: [10],
      };
      this.axios({
        method: 'GET',
        url: '/v1/point/get/detail',
        params,
      })
        .then((response) => {
          const res = response.data;
          if (res.detail) {
            this.detail = res.detail;
            this.shopId = res.detail.shop_id;
            if (moment(new Date()).format('YYYY-MM-DD HH:mm:ss') < res.detail.expire) this.flag.validURL = true;
          }
          this.flag.loaded = true;
        })
        .catch((error) => {
          if (error.message) console.log(error.message);
          console.log(error);
        });
    },
    changeShop(e) {
      this.shopId = Number(e.target.value);
      this.flag.edit = false;
    },
    updatePoint() {
      const data = {
        id: this.detail.id,
        shop_id: this.shopId,
        flag: 1,
        activatekey: null,
        expire: null,
        line_user_id: this.detail.line_user_id,
      };

      this.axios({
        method: 'POST',
        url: '/v1/point/update',
        data,
      })
        .then((response) => {
          if (response.data.updated) this.flag.updated = true;
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response);
            if (error.response.data?.message === 'failed to operate ec point') alert('ポイントの有効化に失敗しました。\nECサイトでカートの中に商品がある場合ポイント利用の処理ができません。お客さまに確認していただき、初めからやり直してください。');
            else alert('ポイントの有効化に失敗しました。再度やり直してください');
          } else {
            console.log(error);
            alert('ポイントの有効化に失敗しました。再度やり直してください');
          }
          this.getDetail();
        });
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  text-align: center;
}
.shop {
  font-weight: 700;
  font-size: 16px;
  padding: 8px 24px;
  border: 1px solid var(--gray);
  display: inline-block;
  margin-bottom: 8px;
}
.info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  .label {
    font-size: 14px;
    margin-right: 18px;
  }
  .point {
    margin-bottom: 0;
    font-size: 28px;
    font-weight: 700;
  }
}
.updated {
  text-align: center;
}
.edit {
  font-size: 12px;
  margin-bottom: 0;
  text-decoration: underline;
  cursor: pointer;
  transition: all .3;
  display: inline-block;
  &:hover {
    opacity: .7;
  }
}
.center {
  text-align: center;
}
</style>
