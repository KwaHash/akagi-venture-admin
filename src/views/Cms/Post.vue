<template>
  <div class="home container">
    <h1 class="page_title">記事投稿・編集</h1>
    <div>
      <Spacer :y="5" />
      <div class="edit" :class="$style.flex_elem">
        <div :class="$style.preview">
          <button :class="$style.preview_newpost" @click="deleteUploadDatas(); deleteSlug()">新規投稿</button>
          <Spacer :y="1" />
          <ul v-if="posts.length">
            <li
              v-for="row in posts"
              :key="row">
              <button :class="row.flag === 2 ? $style.preview_btn_draft : $style.preview_btn" @click="changePost(row)">
                <h5>{{ row.title }}{{ row.flag === 2 ? '(下書き)' : '' }}</h5>
                <!-- <p :class="$style.preview_content" v-html="row.content"></p> -->
              </button>
            </li>
          </ul>
        </div>
        <div :class="$style.flex_elem_left">
          <div v-if="postSelect && postSelect.flag === 1">
            <h4>記事URL</h4>
            <a
              :href="postURL"
              :class="$style.env_url"
              target="_blank"
              >{{ postURL }}</a>
            <Spacer :y="2" />
          </div>
          <h4>タイトル</h4>
          <input
            type="text"
            placeholder="タイトルを入力してください"
            class="form-control"
            v-model="upload.title">

          <div>
          <Spacer :y="3" />
          <h4>外部リンク</h4>
          <label :class="$style.check" for="flexCheckDefault">
            <input :class="$style.check_box" type="checkbox" v-model="upload.linkBlank" id="flexCheckDefault">
            <span :class="$style.check_label">外部リンクを設定する</span>
          </label>
          </div>
          <div v-if="upload.linkBlank">
            <Spacer :y="2" />
            <h4>遷移先URL</h4>
            <input class="form-control" type="text" v-model="upload.blankUrl" placeholder="遷移先のリンクを入力">
          </div>

          <div v-if="!upload.linkBlank">
            <Spacer :y="4" />
            <div
              :class="$style.read_file"
              v-on:dragover="dragover"
              v-on:drop="uploadFile">
              <input
                type="file"
                ref="fileInput"
                id="file"
                accept=".jpg, .jpeg, .JPG, .JPEG, .png, .PNG, .gif, .heic"
                v-on:change="uploadFile">
              <p style="line-height:1.5rem">ドラッグ&ドロップでカーソル位置に画像ファイルを追加<br>※jpg, png, gif, heic形式のみ対応</p>
            </div>

            <Spacer :y="2" />
            <h4>本文</h4>
            <Editor
              ref="editorRef"
              id="editorRef"
              :class="$style.editor"
              @selectionChange="registSelection"
              :api-key="TINYMCE_API_KEY"
              v-model="upload.content"
              v-bind:init="editorConf"
            />
          </div>
        </div>

        <div :class="$style.flex_elem_right">
          <div>
            <h4>公開ステータス</h4>
            <select class="form-control" name="releaseState" id="releaseState" v-model="upload.state">
              <option :value="0">選択してください</option>
              <option
                v-for="row in upload.states"
                :key="row"
                :value="row.value">{{ row.label }}</option>
            </select>
          </div>
          <div>
            <Spacer :y="4" />
            <h4>サイト</h4>
            <select class="form-control" name="siteType" id="siteType" v-model="upload.site">
              <option :value="0">選択してください</option>
              <option
                v-for="row in upload.sites"
                :key="row"
                :value="row.value">{{ row.label }}</option>
            </select>
          </div>
          <div>
            <Spacer :y="4" />
            <h4>ページタイプ</h4>
            <select class="form-control" name="pageType" id="pageType" v-model="upload.page">
              <option :value="0">選択してください</option>
              <option
                v-for="row in upload.pages"
                :key="row"
                :value="row.value">{{ row.label }}</option>
            </select>
          </div>
          <div>
            <Spacer :y="5" />
            <button class="btn btn-primary" @click="preview">プレビュー</button>
          </div>
          <div>
            <Spacer :y="5" />
            <button class="btn btn-primary" @click="submit">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Editor from '@tinymce/tinymce-vue';
// import Loading from '@/components/parts/Loading.vue';
import Spacer from '@/components/Spacer.vue';
import heic2any from 'heic2any';
import { DateTime } from 'luxon';
import imageCompression from 'browser-image-compression'; // 画像ファイル圧縮用

const TINYMCE_API_KEY = process.env.VUE_APP_TINYMCE_API_KEY;

export default {
  name: 'post',
  components: {
    Editor,
    // Loading,
    Spacer,
  },
  data() {
    return {
      TINYMCE_API_KEY,
      flag: {},
      permissionFileType: [
        'image/jpg',
        'image/JPG',
        'image/jpeg',
        'image/JPEG',
        'image/png',
        'image/PNG',
        'image/HEIC',
        'image/heic',
        'image/gif',
        'image/GIF',
      ],
      tinymceEvent: null,
      tinymceDom: null, // tinymce内でカーソル位置を取得するために使用
      postSelect: 0,
      posts: [],
      upload: {
        title: null,
        content: null,
        state: 0,
        states: [
          {
            label: '下書き',
            value: 2,
          },
          {
            label: '公開',
            value: 1,
          },
        ],
        site: 0,
        sites: [
          {
            label: 'AKAGI&VENTURE PROJECT',
            subdir: '',
            value: 1,
          },
          {
            label: 'Hutte Hayashi',
            subdir: 'hutte',
            value: 2,
          },
          {
            label: 'とんとん広場',
            subdir: 'tonton',
            value: 3,
          },
          {
            label: 'ざわざわ森',
            subdir: 'zawazawa',
            value: 4,
          },
          {
            label: 'bacon',
            subdir: 'bacon',
            value: 5,
          },
        ],
        page: 0,
        pages: [
          {
            label: 'ニュース',
            subdir: 'news',
            value: 1,
          },
          {
            label: 'ブログ',
            subdir: 'blog',
            value: 2,
          },
          {
            label: 'コラム',
            subdir: 'column',
            value: 3,
          },
        ],
        linkBlank: false,
        blankUrl: null,
      },
      content: null,
      editorConf: {
        selector: 'textarea',
        content_style: 'img { max-width: 100% }',
        height: 500,
        language: 'ja',
        language_url: '/editor/langs/ja.js',
        menubar: false,
        plugins: [
          'advlist autolink lists link image hr anchor',
          'searchreplace wordcount visualblocks visualchars',
        ],
        toolbar: 'blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | link custom_image | undo redo | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        setup: (editorRef) => {
          editorRef.ui.registry.addButton('custom_image', { 
            icon: 'image', 
            tooltip: '画像挿入', 
            onAction: () => this.$refs.fileInput.click(), 
          });
        },
        file_browser_callback: 'openFileDialog',
      },
      envURL: {
        local: 'http://localhost:8080',
        devlop: 'https://dev.akagi-venture.jp',
        production: 'https://akagi-venture.jp',
      },
    };
  },
  created() {
    if (this.user.email) {
      this.checkRole();
    } else {
      this.$store.subscribe((mutation) => {
        if (mutation.type === 'user/setUserData') {
          this.checkRole();
        }
      });
    }
    this.getPosts();
  },
  setup() {},
  mounted() {},
  computed: {
    ...mapState(['user', 'helper']),

    // 該当記事URLセット
    postURL() {
      const domein = this.envURL[this.helper.env.name];
      const site = this.upload.sites.find((elem) => elem.value === this.postSelect.site);
      const type = this.upload.pages.find((elem) => elem.value === this.postSelect.type);
      const result = `${domein}/${site.subdir}/${type.subdir}/${this.postSelect.slug}`;
      return result;
    },
  },
  watch: {
    $route() {
      if (this.$route.fullPath.includes('slug')) {
        const targetSlug = this.$route.query.slug;
        this.postSelect = this.posts.find((post) => post.slug === targetSlug);
      } else {
        const newURL = `${this.$route.path}/`;
        this.$router.push(newURL);
      }
    },
  },
  methods: {
    // tinymceのselectionをデータに登録
    registSelection(event, editor) {
      this.tinymceEvent = event;
      this.tinymceDom = editor;
    },

    /** ローディング表示 */
    showLoading() {
      const args = { modalName: 'modalLoadingBallScaleRippleMultiple' };
      this.$store.dispatch('modal/loadings/showModal', args, { root: true });
    },

    /** ローディング非表示 */
    hideLoading() {
      this.$store.dispatch('modal/loadings/hideModal', null, { root: true });
    },

    checkRole() {
      if (this.user.role.role < 10) {
        alert('アクセス権限がありません。トップページへリダイレクトします。');
        this.$router.push('/');
      }
    },

    // 投稿内容は下書き以外も編集可能にしたいのでflag = 999以外全て取得
    getPosts() {
      this.axios({
        method: 'GET',
        url: '/v1/post/getlist',
        params: {
          flags: [1, 2],
        },
      })
        .then((response) => {
          const res = response.data.list.data;
          this.posts = res;
          // URL内にslugがあればリロードできているため、当該のpostの各種値をセット
          if (this.$route.fullPath.includes('slug')) {
            const targetSlug = this.$route.query.slug;
            this.postSelect = this.posts.find((post) => post.slug === targetSlug);
            this.setPostValue();
          }
        })
        .catch((err) => {
          if (err.message) console.log(err.message);
          else console.log(err);
        });
    },

    // 既存の記事を選択、URLの書き換えを行う
    changePost(data) {
      this.postSelect = data;
      const currentPath = this.$route.fullPath;
      if (currentPath.includes('slug')) {
        const newURL = `${this.$route.path}?slug=${this.postSelect.slug}`;
        this.$router.push(newURL);
      } else {
        const newURL = `${currentPath}?slug=${this.postSelect.slug}`;
        this.$router.push(newURL);
      }
      this.setPostValue();
    },

    // 過去記事、下書きが選択された際にそのデータをセット
    setPostValue() {
      if (!this.postSelect) { // 新規投稿が選択されたら入力欄を初期化
        this.deleteUploadDatas();
        return true;
      }
      this.upload.title = this.postSelect.title;
      this.upload.content = this.postSelect.content;
      this.upload.state = this.postSelect.flag;
      this.upload.site = this.postSelect.site;
      this.upload.page = this.postSelect.type;
    },

    // ドラッガブルエリアにファイルがドロップされた時
    dragover(e) {
      e.preventDefault();
    },

    // ファイルアップロード時
    async uploadFile(e) {
      e.preventDefault();
      let file;

      // ファイルの入力方法別で入力ファイルを判定
      if (e.type === 'change') {
        file = e.target.files[0];
      } else if (e.type === 'drop') {
        file = e.dataTransfer.files[0];
      }

      // if (file.size > 1920 * 1080) {
      //   alert('所定のサイズよりファイルサイズが大きいです');
      //   return true;
      // }

      // ファイルのタイプ判定画像以外は許可しない
      if (!this.permissionFileType.includes(file.type)) {
        alert('使用可能なファイルの形式は画像ファイルのみです');
        return true;
      }

      // 画像のタイプがheicだったらpngに変換
      if (file.type === 'image/heic') {
        file = await this.heicConvert(file);
      }

      const imagePath = window.URL.createObjectURL(file);

      // カーソル位置に画像を掲載
      const elem = `<img class="editor_img" src="${imagePath}">`; // imgタグだと改行するとエディタ内のblobがdataに変換されてしまうが、アップ直後にs3のパスに変換されるので見かけ上では同じ
      this.tinymceDom.execCommand('mceInsertContent', false, elem);
    },

    // 読み込んだ画像の形式がheicだった際はpngに変換
    async heicConvert(file) {
      this.showLoading();
      let pnged;
      try {
        pnged = await heic2any({ blob: file, toType: 'image/png' });
      } catch (err) {
        console.log(err);
      } finally {
        this.hideLoading();
      }
      return pnged;
    },

    // 画像をS3へ保存
    async uploadToS3(arr) {
      await Promise.all(
        arr.map(async (elem, index) => {
          const filename = `image_${index + 1}`; // ファイル名を変えないとs3で同じパスに対して上書きされてしまう
          const MaxFileSize = 1920 * 1080;
          let blob;
          /**
           * tinymceの中で画像が追加した後に改行や入力などの操作が行われるとblob URLがbase64に変換される
           * 逆に何も入力や操作がないとき（本文の最後に画像を追加した際など）ではローカルのblob URLを参照して画像を表示しているので
           * そのままS3にアップロードしようとするとエラーになる。base64に変換されていない時はblob URLからBlobオブジェクトを作成
           */
          if (elem.includes('base64')) blob = this.base64ToBlob(elem);
          else blob = await fetch(elem).then((res) => res.blob()); // ローカルのblob URLをBlobオブジェクトに変換
          if (blob.size > MaxFileSize) {
            blob = await imageCompression(blob, {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
          }
          const form = new FormData();
          form.append('file', blob);
          await this.axios({
            method: 'POST',
            url: '/v1/media/upload',
            data: form,
            params: { // titleはs3保存時のディレクトリの名前、記事タイトルが入力されていれば記事タイトルをディレクトリとし、なければアップロード日
              title: this.upload.title ? this.upload.title : String(DateTime.local().toFormat('yyyy-MM-dd')),
              environment: this.helper.env.name,
              filename,
            },
          })
            .then(async (response) => {
              const s3path = await response.data.resultData.uploaded.s3Path; // 画像の保存されたs3のパス
              this.upload.content = await this.upload.content.replace(elem, s3path); // base64のimgタグsrcをs3のパスへ置き換え
            })
            .catch((error) => {
              if (error.message) console.log(error.message);
              else console.log(error);
              alert('画像の保存に失敗しました');
            });
        }),
      );
    },

    // base64のURIをblobへ変換
    base64ToBlob(base64) {
      const bin = atob(base64.replace(/^.*,/, ''));
      let blob;
      try {
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) {
          buffer[i] = bin.charCodeAt(i);
        }

        blob = new Blob([buffer.buffer], { type: 'image/png' });
      } catch (err) {
        console.log(err);
        alert('変換に失敗しました');
        return false;
      }
      return blob;
    },

    // 編集内容保存
    async submit() {
      // 保存前チェック
      let saveState = false;
      let srcValues;
      if (!this.upload.state
          || !this.upload.title
          || !this.upload.content
          || !this.upload.page
          || !this.upload.site) {
        saveState = true;
      }

      // 外部リンクを設定にチェックがあるが、外部リンクが入力ないときは返却
      if (this.upload.linkBlank && !this.upload.blankUrl) saveState = true;
      else if (this.upload.linkBlank && this.upload.blankUrl) saveState = false;

      if (saveState) {
        alert('必須項目が入力されていません\n入力項目を確認してください');
        return true;
      }

      // 投稿の是非
      if (!(confirm(`記事を${this.upload.state === 1 ? '公開' : '下書き保存'}します。\nよろしいですか？`))) return true;

      if (this.upload.content) {
        // 記事内に画像があればsrcのデータをバックエンドに送信してs3へ保存
        const originalString = this.upload.content;
        const regexPattern = /<img.*?src="(.*?)".*?>/g; // 正規表現パターンを使ってsrc属性の値を抽出する
        const matches = [...originalString.matchAll(regexPattern)];
        srcValues = matches.map((match) => match[1]);
        srcValues = srcValues.filter((elem) => !elem.includes('s3.amazonaws.com')); // 既に下書きがあり、画像がs3にアップロードされていればその画像はs3アップロードから除外

        if (srcValues.length) await this.uploadToS3(srcValues);
      }

      const slug = this.genSlug();

      // 保存内容の成形
      const data = {
        flag: this.upload.state,
        slug,
        title: this.upload.title,
        content: this.upload.content,
        type: this.upload.page,
        site: this.upload.site,
        external_link: this.upload.linkBlank ? 1 : 0,
        publish_date: DateTime.local().toISO(), // backendでpublish_dateを設定しようとしたらオブジェクトで出力されDB登録エラーになったのでフロントにて対応
      };
      if (this.upload.linkBlank) data.url = this.upload.blankUrl; // 外部リンク設定にチェックがあればリンクをparamsに含む

      // すでに存在している記事の更新であれば別メソッドで上書き保存
      if (this.postSelect) {
        this.updatePost(data);
        return true;
      }

      this.axios({
        method: 'POST',
        url: '/v1/post/regist/',
        data,
      })
        .then((response) => {
          console.log(response);
          alert(`投稿を${this.upload.state === 1 ? '公開' : '下書き保存'}しました`);
        })
        .catch((error) => {
          if (error.message) console.log(error.message);
          else console.log(error);
          alert('投稿に失敗しました。お手数ですが管理者までお問い合わせください。');
        })
        .finally(() => {
          // 入力項目クリア、下書きリスト更新
          this.deleteUploadDatas();
          this.getPosts();
        });
    },

    // 別タブでプレビューを表示
    async preview() {
      // 必要情報が入力されているかチェック
      let saveState = false;
      if (!this.upload.state
          || !this.upload.title
          || !this.upload.content
          || !this.upload.page
          || !this.upload.site) {
        saveState = true;
      }
      if (saveState) {
        alert('必須項目が入力されていません\n入力項目を確認してください');
        return true;
      }

      // プレビュー表示に必要なデータ成形
      const data = {
        title: this.upload.title,
        content: this.upload.content,
        type: this.upload.page,
        publish_date: DateTime.local().toISO(), // backendでpublish_dateを設定しようとしたらオブジェクトで出力されDB登録エラーになったのでフロントにて対応
      };

      const previewPage = window.open( // プレビュー用新規タブを開く
        '/Post/preview',
        '_blank',
      );

      if (previewPage) { //表示に必要なデータを新しく開いたタブへ送信して現在タブを移す
        previewPage.onload = () => previewPage.postMessage(
          data,
          window.location.origin,
        );
        previewPage.focus();
      }
    },

    // 下書きの上書き保存
    async updatePost(data) {
      data.id = this.postSelect.id;

      this.axios({
        method: 'POST',
        url: '/v1/post/update/',
        data,
      })
        .then((response) => {
          console.log(response);
          alert(`投稿を${this.upload.state === 1 ? '公開' : '下書き保存'}しました`);
        })
        .catch((error) => {
          if (error.message) console.log(error.message);
          else console.log(error);
          alert('投稿の上書き保存に失敗しました。お手数ですが管理者までお問い合わせください');
        })
        .finally(() => {
          // 入力項目クリア、下書きリスト更新
          this.deleteUploadDatas();
          this.getPosts();
        });
    },

    // 投稿、上書き保存完了時などコンテンツをリセット
    deleteUploadDatas() {
      // 記事テキストエリアに入力があればクリア
      if (this.upload.content) this.tinymceDom.resetContent();
      this.postSelect = 0;
      this.upload.title = null;
      this.upload.state = 0;
      this.upload.site = 0;
      this.upload.page = 0;
      this.upload.linkBlank = false;
      this.upload.blankUrl = null;
      // 画像がアップロードされているようであればドロップエリアのファイル名もクリア
      const id = document.getElementById('file');
      if (id !== null) id.value = '';
    },

    // 新規投稿を選択、URLからslugを削除
    deleteSlug() {
      const currentRoute = this.$route;
      // クエリパラメータを削除
      const newQuery = { ...currentRoute.query };
      delete newQuery.slug;

      const newRoute = {
        name: currentRoute.name,
        params: currentRoute.params,
        query: newQuery,
      };

      this.$router.push(newRoute);
    },

    // 投稿の識別用のランダム8桁のslug発行
    genSlug() {
      const length = 8;
      const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';

      for (let i = 0; i < length; i += 1) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }

      return result;
    },
  },
};
</script>

<style lang="scss" module>
.wrap {
  display: flex;
  justify-content: center;
}

.title {
  text-align: center;
  color: var(--orange-main);
}

.form {
  text-align: center;
}

.btn {
  display: inline-block;
  border-radius: 22px;
  border: none;
  background-color: #666;
  font-weight: bold;
  color: #fff;
  appearance: none;
  padding: 8px 25px;
  font-size: 16px;
}

.message {
  font-size: 12px;
  text-align: center;
}

.input {
  margin: 0 auto;
  width: 400px;
  max-width: 100%;
  input {
    width: 100%;
    padding: 13px;
    border-radius: 8px;
    border: none;
    background-color: var(--gray-sub);
    outline: none;
  }
}

.textarea {
  padding: 20px;
  background-color: var(--gray-sub);
  border: none;
  outline: none;
  width: 100%;
  border-radius: 8px;
}

.flex_elem {
  display: flex;
  gap: 30px;
  &_left {
    flex: 3;
  }
  &_right {
    flex: 1;
  }
}

.preview {
  flex: 1;
  &_content {
    img {
      display: none;
    }
  }
  &_newpost {
    padding: 5px;
    background-color: #2C7CFF;
    color: white;
    border: 1px solid #DDDDDD;
    border-radius: 10px;
    cursor: pointer;
    outline: none;
  }
  &_btn {
    width: 100%;
    background-color: transparent;
    border: 1px solid #DDDDDD;
    border-radius: 10px;
    cursor: pointer;
    outline: none;
    padding: 15px;
    margin-bottom: .5em;
    appearance: none;
    &_draft {
      width: 100%;
      background-color: #FFC0CB;
      border: 1px solid #DDDDDD;
      border-radius: 10px;
      cursor: pointer;
      outline: none;
      padding: 15px;
      margin-bottom: .5em;
      appearance: none;
    }
  }
  &_btn:hover {
    padding: 15px;
    margin-bottom: .5em;
    background-color: #2C7CFF;
    border: 1px solid white;
    border-radius: 10px;
    color: white;
  }
}

.env_url {
  color: #777777;
}

.preview_image {
  width: 120px;
  padding-top: 120px;
  background-size: contain;
  background-position: center;
}

.read_file {
  display: block;
  text-align: center;
  background-color: #EEEEEE;
  padding: 15px;
  border: 2px dashed gray;
  border-radius: 5px;
  position: relative;
  button {
    margin-top: 10px;
  }
  .assistance {
    position: absolute;
    top: 72%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    background-color: transparent;
    z-index: 0;
  }
}

.check {
  &_box {
    display: none;
  }
  &_label {
    padding-left: 2em;
    position: relative;
    cursor: pointer;
  }
  &_label::before {
    content: '';
    display: inline-block;
    position: absolute;
    width: 20px;
    padding-top: 17px;
    top: 0;
    left: 5px;
    border: 1px solid #444444;
    border-radius: 3px;
  }
  &_label::after {
    content: '';
    display: inline-block;
    position: absolute;
    width: 14px;
    padding-top: 7px;
    top: 3px;
    left: 8px;
    border-left: 2px solid black;
    border-bottom: 2px solid black;
    transform: rotate(-45deg);
    opacity: 0;
  }
  &_box:checked + span::after {
    opacity: 1;
  }
}
</style>
