<template>
  <div class="container">
    <h1 class="page_title">店舗一覧</h1>
    <Spacer :y="3" />
    <ul class="list-group">
      <li
        class="list-group-item"
        v-for="shop in shops"
        :key="shop.id">
        <div :class="$style.item">
          <div class="d-flex align-items-center">
            <div
              :class="[
                $style.img,
                imgs[shop.name] ? '' : $style.noimg,
              ]"
              :style="`background-image: url(${imgs[shop.name]});`" />
            <div
              v-if="editId !== shop.id">
              <div>{{ shop.label }}</div>
              <div :class="$style.desc">{{ shop.description }}</div>
              <div :class="$style.desc">{{ shop.name }}</div>
            </div>
          </div>
          <!-- <div
            v-if="editId === shop.id"
            :class="$style.form">
            <ul>
              <li
                v-for="item in updateItems"
                :key="item.name">
                <input
                  :name="item.name"
                  :type="item.type"
                  :placeholder="item.placeholder"
                  v-model="item.value">
              </li>
            </ul>
          </div> -->
          <div>
            <ul class="btn-list horizontal" :class="$style.btns">
              <li v-if="editId !== shop.id">
                <div
                  class="btn btn-sm btn-outline-primary"
                  @click="$router.push(`/holiday/${shop.name}`)">休日登録</div>
              </li>
              <!-- <li v-if="editId !== shop.id">
                <div
                  class="btn btn-sm btn-outline-primary"
                  @click="editStart(shop)">編集する</div>
              </li>
              <li v-if="editId === shop.id">
                <div
                  class="btn btn-sm btn-primary"
                  @click="submit('update', 1)">保存</div>
              </li>
              <li v-if="editId === shop.id">
                <div
                  class="btn btn-sm btn-danger"
                  @click="submit('update', 999)">削除する</div>
              </li>
              <li v-if="editId === shop.id">
                <div
                  @click="editId = null"
                  class="btn btn-sm btn-outline-primary">キャンセル</div>
              </li> -->
            </ul>
          </div>
        </div>
      </li>
      <!-- <li
        v-if="flag.showRegist"
        class="list-group-item">
        <div :class="$style.item">
          <ul :class="$style.form">
            <li
              v-for="item in createItems"
              :key="item.name">
              <input
                :name="item.name"
                :type="item.type"
                :placeholder="item.placeholder"
                v-model="item.value">
            </li>
          </ul>
          <Spacer :y="1"/>
          <ul class="btn-list horizontal" :class="$style.btns">
            <li>
              <div
                class="btn btn-primary"
                @click="submit('create', 1)">登録</div>
            </li>
            <li>
              <div
                class="btn btn-outline-primary"
                @click="flag.showRegist = !flag.showRegist">キャンセル</div>
            </li>
          </ul>
        </div>
      </li> -->
    </ul>

    <!-- <div v-if="!flag.showRegist">
      <Spacer :y="3"/>
      <div
        class="btn btn-primary"
        @click="flag.showRegist = !flag.showRegist"
        >新規登録</div>
    </div> -->
  </div>
</template>

<script>
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'shop-list',
  components: {
    Spacer,
  },
  data() {
    return {
      flag: {
        showInput: false,
        showRegist: false,
      },
      imgs: {
        bacon: '/img/shopIcons/bacon.png',
        tonton: '/img/shopIcons/tonton.png',
        hutte: '/img/shopIcons/hutte.png',
        zawazawa: '/img/shopIcons/zawazawa.png',
      },
      createItems: [
        {
          type: 'text',
          name: 'label',
          placeholder: '店舗名',
          value: null,
        },
        {
          type: 'text',
          name: 'description',
          placeholder: '備考',
          value: null,
        },
        {
          type: 'text',
          name: 'name',
          placeholder: 'ID(※他の店舗と重複できません)',
          value: null,
        },
      ],
      updateItems: [
        {
          type: 'text',
          name: 'label',
          placeholder: '店舗名',
          value: null,
        },
        {
          type: 'text',
          name: 'description',
          placeholder: '備考',
          value: null,
        },
        {
          type: 'text',
          name: 'name',
          placeholder: 'ID(※他の店舗と重複できません)',
          value: null,
        },
      ],
      editId: null,
      shops: [],
    };
  },
  created() {
    this.getShops();
  },
  methods: {
    initItems() {
      this.createItems.forEach((item) => {
        item.value = null;
      });
    },
    editStart(shop) {
      this.editId = shop.id;
      this.updateItems.forEach((item) => {
        item.value = shop[item.name];
      });
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
    submit(type, flag) {
      const data = {
        id: type === 'update' ? this.editId : null,
        flag,
      };
      if (flag !== 999) {
        this[`${type}Items`].forEach((item) => {
          data[item.name] = item.value;
        });
        /** nameのスペース削除 */
        data.name = data.name.replace(/\s+/g, '');

        /** nameは半角英数記号のみ */
        if (!data.name.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/)) {
          return alert('店舗IDは半角英数および記号のみが利用できます。');
        }
        if (!data.label || !data.name) {
          return alert('店舗名・店舗IDを入力してください。');
        }
      }

      const label = type === 'create' ? '登録' : '更新';
      this.axios({
        method: 'POST',
        url: `v1/shop/${type}`,
        data,
      })
        .then((response) => {
          const res = response.data;
          if (res.exists) {
            alert('店舗IDが重複しています。\n利用されていない店舗IDを設定してください。');
          } else {
            alert(`店舗を${flag === 999 ? '削除' : label}しました。`);
            this.getShops();
            if (type === 'update') {
              this.editId = null;
            } else {
              this.initItems();
              this.flag.showRegist = false;
            }
          }
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        })
        .finally(() => {
          this.flag.loader = false;
        });
    },
  },
};
</script>

<style lang="scss" module>
.img {
  width: 80px;
  padding-top: 80px;
  margin-right: 12px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  &.noimg {
    position: relative;
    background-color: var(--gray-light);
    &::after {
      content: 'No image';
      font-size: 12px;
      text-align: center;
      color: #fff;
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
    }
  }
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.desc {
  margin-top: 8px;
  font-size: 12px;
}
.form {
  flex: 1;
  margin-right: 24px;
  li {
    &:not(:first-child) {
      margin-top: 6px;
    }
    input {
      width: 100%;
      border-radius: 0px;
      padding: 0 8px;
      border: 1px solid #ccc;
      outline: none;
      font-size: 16px;
    }
  }
}
.regist {
  dl {
    &:last-child {
      margin-bottom: 0;
    }
  }
  dt {
    font-size: 14px;
    font-weight: normal;
  }
}
@media (max-width: 768px) {
  .item {
    display: block;
    .btns {
      margin-top: 12px;
    }
  }
}
</style>
