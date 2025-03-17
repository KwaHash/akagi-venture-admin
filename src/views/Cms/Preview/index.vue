<template>
  <div :class="s.container">
    <div :class="s.space_top" />
    <section
      v-if="post"
      :class="s.post_view">
      <article>
        <h3>{{ post.publish_date }}</h3>
        <h2>{{ post.title }}</h2>
        <span :class="s.news_type">{{ post.type }}</span>
        <div
          :class="s.post_content"
          v-html="post.content"></div>
      </article>
    </section>
    <section>
      <div :class="s.sandwiched">
        <div :class="s.backhome">
          <nuxt-link to="/">トップページへ戻る</nuxt-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// import axios from '@/plugins/axios';
import { DateTime } from 'luxon';

// preview.vueからはこのパスでimportできないというコンパイルエラーが発生
// import newsList from '@/assets/jsonFiles/newsList'; // サイト、タイプなどの区分け

export default {
  name: 'preview',
  components: {},
  data() {
    return {
      beforePost: null,
      post: null,
      afterPost: null,
      // newsList.jsonが読み取れなかったので手動で入力
      newsList: {
        type: {
          1: 'ニュース',
          2: 'ブログ',
          3: 'コラム',
        },
        site: {
          1: 'A&V PROJECT',
          2: 'HUTTE HAYASHI',
          3: 'とんとん広場',
          4: 'ざわざわ森',
          5: 'BACON',
        },
      },
    };
  },
  created() {
    // イベントリスナーの追加はcreated内 or mounted内のどちらにすべきなのか不明
    // window.addEventListener('message', this.getData);
  },
  mounted() {
    window.addEventListener('message', this.getData);
  },
  unmounted() {
    window.removeEventListener('message', this.getData);
  },
  methods: {
    getData(event) {
      try {
        if (event.origin === window.location.origin && this.post == null) {
          const data = event.data;
          // console.log(data);
          this.post = {
            publish_date: DateTime.fromISO(data.publish_date).toFormat('yyyy-MM-dd'),
            title: data.title,
            type: this.newsList.type[data.type],
            content: data.content,
          };
        }
      } catch (error) {
        if (error.message) console.log(error.message);
        else console.log(error);
      }
    },
  },
};
</script>

<style module="s" lang="scss">
.container {
  // color
  --c-main: rgb(36, 108, 168);
  --c-text: #251e1c;

  height: var(--h);
  color: var(--c-text);
}
.space {
  &_top {
    padding-top: 150px;
    //@include mq.smView {
    //  padding-top: 80px;
    //}
  }
}
.post {
  &_view {
    width: 80%;
    margin: 0 auto;
  }
  &_content {
    padding-top: 30px;
    img {
      width: 100%;
      margin: 25px auto;
    }
  }
}
.news_type {
  color: #333333;
}
.sandwiched {
  width: 80%;
  margin: 30px auto;
}
.flex_elem {
  display: flex;
  justify-content: center;
}
.otherposts {
  padding: 20px;
}
.backhome {
  text-align: right;
  padding: 10px;
}
</style>
<!-- <style>
img {
  width:  80%;
  margin: 20px auto;
}
</style> -->
