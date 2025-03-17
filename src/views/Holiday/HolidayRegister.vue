<template>
  <div class="container container-sp">
    <div v-if="shop">
      <Spacer :y="2"/>
      <div :class="$style.shopLabel">休日登録｜{{ shop.label }}</div>
      <Spacer :y="6"/>
      <div :class="flag.isLoading ? $style.loading : ''">
        <div :class="$style.monthLabel">
          <div :class="$style.arrow" @click="changeMonth(0)"><span>＜</span></div>
          <p :class="$style.label">{{ year }}年{{ month }}月</p>
          <div :class="$style.arrow" @click="changeMonth(1)"><span>＞</span></div>
        </div>
        <div>
          <ul :class="$style.weekList">
            <li
              v-for="w of numOfWeek + 1"
              :key="w">
              <ul :class="$style.dayList">
                <li v-if="w === 1"
                  v-for="n of 7" :key="n">
                  <div :class="$style.inner">{{ ['日', '月', '火', '水', '木', '金', '土'][n - 1] }}</div>
                </li>
                <li
                  v-if="w !== 1"
                  :class="[
                    selectedDate.year === year && selectedDate.month === month && selectedDate.day === date(w - 1, d) ? $style.selected : '',
                    isHoliday(date(w - 1, d)) && date(w - 1, d) ? $style.holiday : '',
                    date(w - 1, d) ? $style.selectable : '',
                    roundClass(w, d),
                    d === 1 ? $style.sun : d === 7 ? $style.sat : '',
                  ]"
                  v-for="d of 7"
                  :key="d"
                  @click="date(w - 1, d) ? selectDate(date(w - 1, d)) : ''">
                  {{ roundClass() }}
                  <div :class="$style.inner">
                    {{ date(w - 1, d) }}
                  </div>
                </li>
              </ul>
            </li>
          </ul>
          <Spacer :y="2"/>
          <div>
            <div
              v-if="selectedDate.year && selectedDate.month && selectedDate.day">
              <p :class="$style.selectedDate">{{ selectedDate.year }}/{{ zeroPadding(selectedDate.month, 2) }}/{{ zeroPadding(selectedDate.day, 2) }}</p>
              <div :class="$style.form">
                <input
                  :class="$style.input"
                  type="text"
                  v-model="label"
                  placeholder="ラベル">
                <Spacer :x="1"/>
                <div class="btn-list horizontal">
                  <div class="btn btn-primary" @click="submit(1)">
                    保存
                  </div>
                  <Spacer :x="1" v-if="selectHoliday"/>
                  <div class="btn btn-outline-primary"
                    v-if="selectHoliday"
                    @click="submit(999)">
                    削除
                  </div>
                </div>
              </div>
            </div>
            <p v-else>日付を選択してください。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Spacer from '@/components/Spacer.vue';

export default {
  name: 'holiday-register',
  components: {
    Spacer,
  },
  data() {
    return {
      flag: {
        isLoading: true,
      },
      year: Number(moment(new Date()).format('YYYY')),
      month: Number(moment(new Date()).format('MM')),
      selectedDate: {
        year: null,
        month: null,
        day: null,
      },
      label: null,
      holidays: [],
      selectHoliday: null,
      shop: null,
    };
  },
  created() {
    this.getShop();
  },
  computed: {
    numOfWeek() {
      return Math.ceil((this.dayOfMonth + this.dayOfFirst) / 7);
    },
    dayOfMonth() {
      const fromM = this.month;
      const toM = fromM < 12 ? fromM + 1 : 1;
      const toY = fromM < 12 ? this.year : this.year + 1;
      const fromStr = `${this.year}-${this.zeroPadding(fromM, 2)}-01`;
      const toStr = `${toY}-${toM < 10 ? `0${toM}` : toM}-01`;
      const from = moment(fromStr);
      const to = moment(toStr);
      const diff = to.diff(from, 'days');
      return Number(diff);
    },
    dayOfFirst() {
      return Number(moment(`${this.year}-${this.zeroPadding(this.month, 2)}-01`).format('d'));
    },
  },
  methods: {
    getShop() {
      const shopName = this.$route.params.name;

      this.axios({
        method: 'GET',
        url: 'v1/shop/get/detail',
        params: { name: shopName },
      })
        .then((response) => {
          const res = response.data;
          this.shop = res.detail;
          this.getHolidays();
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
          this.flag.isLoading = false;
        });
    },

    getHolidays() {
      const params = {
        shop_id: this.shop.id,
        year: this.year,
        month: this.month,
      };
      this.axios({
        method: 'GET',
        url: 'v1/holiday/get/list',
        params,
      })
        .then((response) => {
          const res = response.data;
          this.holidays = res.list;
        })
        .catch((error) => {
          if (error.response) console.log(error.response.data);
          else console.log(error);
        })
        .finally(() => {
          this.flag.isLoading = false;
        });
    },

    submit(flag) {
      this.flag.isLoading = true;
      const data = {
        flag,
        label: this.label,
        holiday_at: moment([this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day]).format('YYYY-MM-DD'),
        shop_id: this.shop.id,
      };
      if (this.selectHoliday) data.id = this.selectHoliday.id;

      const type = this.selectHoliday ? 'update' : 'create';
      const label = this.selectHoliday ? '更新' : '登録';
      this.axios({
        method: 'POST',
        url: `/v1/holiday/${type}`,
        data,
      })
        .then(() => {
          alert(`休日を${flag === 999 ? '削除' : label}しました。`);
          this.getHolidays();
          this.selectedDate = {
            year: null,
            month: null,
            day: null,
          };
          this.label = null;
        })
        .catch((error) => {
          if (error.message) console.log(error.message);
          console.log(error);
          this.flag.isLoading = false;
        });
    },

    zeroPadding(num, len) {
      return (Array(len).join('0') + num).slice(-len);
    },
    date(w, d) {
      const dayNum = (w - 1) * 7 + d - this.dayOfFirst;
      return dayNum > 0 && dayNum <= this.dayOfMonth ? dayNum : '';
    },
    isHoliday(date) {
      return Boolean(this.holidays.find((h) => h.holiday_at === `${this.year}-${this.zeroPadding(this.month, 2)}-${this.zeroPadding(date, 2)}`));
    },
    roundClass(w, d) {
      if (w === this.numOfWeek + 1 && d === 1) return this.$style.roundBL;
      if (w === this.numOfWeek + 1 && d === 7) return this.$style.roundBR;
      return '';
    },

    changeMonth(flag) {
      if (flag) { // 次月へ
        if (this.month < 12) this.month += 1;
        else {
          this.month = 1;
          this.year += 1;
        }
      } else if (this.month !== 1) { // 前月へ
        this.month -= 1;
      } else {
        this.month = 12;
        this.year -= 1;
      }
      this.getHolidays();
    },
    selectDate(date) {
      this.selectedDate = {
        year: this.year,
        month: this.month,
        day: date,
      };
      const target = this.holidays.find((h) => h.holiday_at === `${this.year}-${this.zeroPadding(this.month, 2)}-${this.zeroPadding(date, 2)}`);
      if (target) {
        this.label = target.label;
        this.selectHoliday = target;
      } else {
        this.label = null;
        this.selectHoliday = null;
      }
    },
  },
};
</script>

<style lang="scss" module>
.shopLabel {
  font-weight: bold;
  font-size: 20px;
}

.loading {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    $mgn: 20px;
    top: -$mgn; left: -$mgn;
    width: calc(100% + $mgn * 2);
    height: calc(100% + $mgn * 2);
    background-color: rgba(#fff, 0.7);
  }
  &::before {
    content: 'Loading...';
    position: absolute;
    font-weight: bold;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
}

.monthLabel {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .label {
    margin: 0 12px;
    font-weight: bold;
    font-size: 20px;
  }

  .arrow {
    height: 30px;
    width: 30px;
    background: #aaa;
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: all .3s;
    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
    }
    &:hover {
      background-color: rgba(#aaa, 0.3);
    }
  }
}

.weekList {
  border: 1px solid #aaaaaa;
  border-radius: 8px;
  li {
    &:not(:first-child) {
      border-top: 1px solid #aaaaaa;
    }
  }
}
.dayList {
  display: flex;
  li {
    transition: all .3s;
    width: calc(100% / 7);
    padding: 2px;
    text-align: center;
    &.roundBL { border-radius: 0 0 0 8px; .inner { border-radius: 0 0 0 7px; } }
    &.roundBR { border-radius: 0 0 8px 0; .inner { border-radius: 0 0 7px 0; } }

    &.sun { color: red; }
    &.sat { color: blue; }

    &:not(:first-child) {
      border-top: none;
      border-left: 1px solid #aaaaaa;
    }

    &.selectable {
      cursor: pointer;
    }
    &:not(.selectable) {
      &:hover {
        background-color: transparent;
      }
    }

    &.selected {
      background-color: pink;
    }

    &.holiday {
      background-color: rgb(255, 230, 234);
      .inner {
        background-color: rgb(255, 230, 234);
      }
    }

    .inner {
      background-color: #fff;
      padding: 10px;
      height: 100%;
    }

    &:hover {
      background-color: #aaaaaa;
    }

  }
}

.selectedDate {
  font-weight: bold;
}
.form {
  display: flex;
  align-items: center;
}
.input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #aaa;
  outline: none;
  flex: 1;
}
</style>
