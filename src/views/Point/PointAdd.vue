<template>
  <div class="container container-xs" v-if="user.email">
    <h1 class="page_title center">ポイント付与</h1>
    <Spacer :y="3"/>
    <div v-if="!flag.registed">
      <dl v-if="!user.shops?.[0]">
        <dt class="form-label center">店舗を選択してください</dt>
        <dd>
          <select
            name="shop"
            id="shop"
            class="form-control"
            @change="changeShop">
            <option :value="0">選択してください</option>
            <option
              v-for="shop in shops"
              :key="shop.id"
              :value="shop.id">{{ shop.label }}</option>
          </select>
        </dd>
      </dl>
      <Spacer :y="2"/>
      <dl>
        <dt class="form-label center">対象金額を入力してください</dt>
        <dd>
          <div :class="$style.note" class="mb-3 mt-3">
            <p :class="$style.red" class="mb-2">※お支払い金額を入力してください。</p>
            <p>ポイント数は自動計算されます。<br>（100円 = 1ポイント）</p>
          </div>
          <input
            type="number"
            v-model="price"
            class="form-control">
          <div :class="$style.tentative" class="mt-5">
            <div>
              <div :class="$style.label">ポイント利用店舗</div>
              <div :class="$style.shop">{{ selectedShopData ? selectedShopData.label : '未選択' }}</div>
            </div>
            <div class="mt-4">
              <div :class="$style.label">付与ポイント</div>
              <div :class="$style.point">{{ amount }}</div>
            </div>
          </div>
        </dd>
      </dl>
      <Spacer :y="4"/>
      <ul class="btn-list center horizontal">
        <li>
          <button
            :disabled="!shopId || !amount"
            class="btn btn-primary"
            @click="registPoint">QRコードを発行する</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <div :class="$style.info">
        <div :class="$style.label">取得ポイント数</div>
        <p :class="$style.point">{{ amount }}</p>
      </div>
      <Spacer :y="3"/>
      <div :class="$style.code">
        <img :src="`https://api.qrserver.com/v1/create-qr-code/?data=${url}&size=335x335`">
      </div>
      <Spacer :y="4"/>
      <ul class="btn-list center horizontal">
        <li>
          <div
            class="btn btn-primary"
            @click="init">リセット</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'point-add',
  components: {
    Spacer,
  },
  data() {
    return {
      flag: {
        registed: false,
      },
      price: null,
      shopId: 0,
      pointPercentage: 1, // 切り捨て
      url: null,
      officialLineId: {
        production: '@349yfgsc',
        develop: '@075ogxha',
        local: '@784uoaud',
      },
      shops: [],
    };
  },
  created() {
    this.getShops();
    if (this.user.email) {
      this.setShop();
    } else {
      this.$store.subscribe((mutation) => {
        if (mutation.type === 'user/setUserData') {
          this.setShop();
        }
      });
    }
  },
  computed: {
    ...mapState(['user', 'helper']),
    amount() {
      return Math.floor((this.price * this.pointPercentage) / 100);
    },
    selectedShopData() {
      return this.shops.find((shop) => shop.id === this.shopId);
    },
  },
  methods: {
    changeShop(e) {
      this.shopId = Number(e.target.value);
    },
    setShop() {
      this.shopId = this.user.shops[0]?.id || 0; 
    },
    init() {
      this.price = null;
      this.url = null;
      this.flag.registed = false;
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
    registPoint() {
      const env = this.helper.env.name;
      const data = {
        flag: 10, // 承認待ち
        shop_id: this.shopId,
        amount: this.amount,
        type: 1, // ポイント付与
      };
      this.axios({
        method: 'POST',
        url: '/v1/point/create',
        data,
      })
        .then((response) => {
          const res = response.data;
          this.url = `https://line.me/R/oaMessage/${this.officialLineId[env]}/?ID:${res.activatekey}`;
          this.flag.registed = true;
        })
        .catch((error) => {
          alert('QRコードの発行に失敗しました。再度やり直してください。');
          if (error.message) console.log(error.message);
          console.log(error);
        });
    },
  },
};
</script>

<style lang="scss" module>
.note {
  font-size: 14px;
  text-align: center;
  p {
    margin-bottom: 0;
  }
  .red {
    color: red;
  }
}
.tentative {
  text-align: center;
  background-color: var(--navy-bg);
  padding: 32px 12px 24px;
  border-radius: 8px;

  .label {
    font-size: 14px;
  }
  .shop {
    margin-top: 8px;
    font-size: 20px;
  }
  .point {
    font-size: 28px;
    font-weight: 700;
  }
}

.code {
  width: 100%;
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
</style>
