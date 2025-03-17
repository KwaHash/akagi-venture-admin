/*
 * 共通関数
 * コンポーネントで使用するにはmixinsで読み込む
 * import cf from '@/mixins/commonFunctions';
 * mixins: [cf],
 */

import moment from 'moment';
import { cloneDeep } from 'lodash';

export default {
  /**
   * localStorage[${key}]の値を返却
   * @param  str key localStorageの対象キー
   * @return obj jsonパース済みオブジェクト
   */
  getLocalStorage(key) {
    let result;
    if (localStorage[key]) {
      result = JSON.parse(localStorage[key]);
    }
    return result;
  },


  /**
   * ローカルストレージに保存
   * @param obj 既存データにマージしたいオブジェクト
   * @param str key localStorageの対象キー
   */
  saveLocalStorage(obj, key = '') {
    if (!key) return;
    const ls = this.getLocalStorage(key);
    const save = ls ? { ...ls, ...obj } : obj;
    const stringify = JSON.stringify(save);
    localStorage.setItem(key, stringify);
  },


  /**
   * localStorage削除
   * @param key localStorageから削除するキー
   */
  deleteLocalStorage(key, key2 = null) {
    if (!key) return;
    if (localStorage[key]) {
      if (!key2) {
        localStorage.removeItem(key);
        console.log(`localStorage[${key}]を削除しました`);
      } else {
        // 特定の子階層のみを削除

        // 指定キー以外を一時ストック
        const stock = {};
        const target = JSON.parse(localStorage[key]);

        const keys = Object.keys(target);
        for (let i = 0; i < keys.length; i += 1) {
          const k = keys[i];
          if (k !== key2) stock[k] = target[k];
        }
        // 一度localstorage[key]ごと削除して
        localStorage.removeItem(key);
        // ストックしておいたkey2の除外データを保存
        this.saveLocalStorage(stock, key);
        console.log(`localStorage[${key}]の[${key2}]を削除しました`);
      }
    } else {
      console.log(`localStorage[${key}]は存在しません`);
    }
  },


  /**
   * 文字列判定
   * @param value
   * @return bool
   */
  isString(inputText) {
    return (typeof inputText === 'string' || inputText instanceof String);
  },


  /**
   * 数値判定（NaNやInfinityは無効）
   * @param value
   * @return bool
   */
  isNumber(value) {
    return Number.isFinite(value);
  },


  /**
   * 整数値の判定
   * @param str
   * @return bool
   */
  checkInteger(str) {
    if (!str) return false;
    return String(str).match(/^[+|-]?[0-9]+$/);
  },


  /**
   * 整数値か小数値の判定
   * @param str
   * @return bool
   */
  checkFloat(str) {
    if (!str) return false;
    return str.match(/^[-|+]?[0-9]*\.[0-9]+$|^[+|-]?[0-9]+$/);
  },


  /**
   * valueが整数値に変更可能かどうか
   * @param value
   * @return bool
   */
  convert2Num(str) {
    if (!str) return null;
    if (!this.checkInteger(str)) return null;
    const result = Number(str);
    return this.isNumber(result) ? result : null;
  },


  /** URLからページ番号取得 */
  getPageNum(route) {
    const query = route.query;
    const page = this.convert2Num(query.page);
    return page || 1;
  },


  /**
   * ページネーション配列の生成
   * @param object args
   *   currentPage
   *   lastPage
   * @return array
   *
   * パターン1
   *   合計ページ数が5未満
   * パターン2
   *   1 2 3 4 ... 50
   * パターン3
   *   1 ... 48 49 50
   * パターン4
   *   1 ... 3 4 5 ... 50
   */
  generatePagination(args) {
    const result = [];
    const last = args.lastPage;
    const prevNext = last > 5;

    // 1ページ完結の場合はスルー
    if (last === 1) return [];

    // prevボタン
    if (prevNext) {
      result.push({
        class: 'prev',
        icon: 'fal fa-angle-left',
        page: args.currentPage - 1,
      });
    }

    // パターン毎にpager作成
    const start = [1, 2, 3];
    const end = [(last - 2), (last - 1), last];
    const num = 4;
    if (!prevNext) {
      for (let i = 0; i < last; i += 1) {
        result.push({ page: i + 1 });
      }
    } else if (start.includes(args.currentPage)) {
      // パターン1
      for (let i = 0; i < num; i += 1) {
        result.push({ page: i + 1 });
      }
      result.push(
        { dot: true },
        { page: last },
      );
    } else if (end.includes(args.currentPage)) {
      // パターン2
      result.push(
        { page: 1 },
        { dot: true },
      );
      for (let i = 0; i < 4; i += 1) {
        result.push({ page: last - (num - i - 1) });
      }
    } else {
      // パターン3
      result.push(
        { page: 1 },
        { dot: true },
        { page: args.currentPage - 1 },
        { page: args.currentPage },
        { page: args.currentPage + 1 },
        { dot: true },
        { page: last },
      );
    }

    // nextボタン
    if (prevNext) {
      result.push({
        class: 'next',
        icon: 'fal fa-angle-right',
        page: args.currentPage + 1,
      });

      // 現ページが最初か最後の場合はdisabledクラス追加
      if (args.currentPage === 1) result[0].class = 'prev disabled';
      if (args.currentPage === last) result[result.length - 1].class = 'next disabled';
    }

    return result;
  },

  /**
   * 環境に応じてstripeのpublicKeyを返却
   */
  getStripePubKey() {
    let STRIPE_PUB_KEY = null;
    switch (process.env.NODE_ENV) {
      case 'production':
        STRIPE_PUB_KEY = process.env.VUE_APP_STRIPE_PUBLIC_KEY_PROD;
        break;
      default:
        STRIPE_PUB_KEY = process.env.VUE_APP_STRIPE_PUBLIC_KEY_DEV;
        break;
    }
    return STRIPE_PUB_KEY;
  },


  /**
   * 桁数を合わせる
   */
  zeroPadding(num, len) {
    return (Array(len).join('0') + num).slice(-len);
  },


  /**
   * 【重要】
   * コンポーネントで直接使用するには
   * methodsオブジェクトに入れておく必要がある
   */
  methods: {
    /** タイムスタンプのフォーマット */
    formatTimestamp(stamp, format = 'YYYY-MM-DD') {
      let result = moment(stamp, 'X').format(format);
      if (!String(stamp).includes('GMT')) {
        result = moment(stamp).format(format);
      }
      return result;
    },

    /**
     * クレジットカードアイコン名
     * mastercard
     * visa
     * amex
     * jcb
     * discover
     * diners-club
     */
    getCardIconName(brand) {
      const lowercase = brand.toLowerCase();
      let result;
      switch (lowercase) {
        case 'american express': result = 'amex'; break;
        case 'diners club': result = 'diners-club'; break;
        default: result = lowercase; break;
      }
      return result;
    },

    /** クローンオブジェクトの返却 */
    getClone(object) {
      return cloneDeep(object);
    },

    /**
     * アイコンURL（type = 2）の返却
     * @param obj object
     *   ユーザ等特定idのオブジェクト
     */
    getMyIconUrl(object) {
      const defaultIcon = '/img/default/icon.png';
      let url = defaultIcon;

      if (!object) return url;

      const keys = Object.keys(object);
      if (!keys.includes('urls')) return url;

      const isArray = Array.isArray(object.urls);
      if (isArray) {
        // adjustUrls未適用（[{}, {}, ...]）
        const urls = object.urls || [];

        if (urls.length) {
          // item.type = 2（アイコン）画像を返却する
          urls.some((item) => {
            if (item.type === 2) {
              url = item.url || defaultIcon;
              return true;
            }
            return false;
          });
        }
      } else if (object.urls && object.urls.icon.length) {
        // adjustUrls適用済み（{ main: {}, icon: {}, ... }）
        url = object.urls.icon[0].url || defaultIcon;
      }

      return url;
    },

    /**
     * ユーザオブジェクトから表示ラベルを返却
     * // 1. usernameが存在する場合は優先
     * // 2. usernameなくfacebook.nameが存在する場合はfacebook.name
     * // 3. username・facebook.nameともにない場合はemail
     */
    getUserLabel(user) {
      let name = user.email;
      if (user.facebook) name = user.facebook.name;
      if (user.username) name = user.username;
      return name;
    },

    /**
     * アイキャッチ取得
     * data.eyecatchの有無でデフォ画像と振り分け
     */
    getEyecatch(data) {
      return data.eyecatch || '/img/default/default.jpg';
    },

    /** 文字列の中からimgタグとhtmlタグを除去 */
    replaceImgTag(str) {
      let result = str;
      if (str) {
        // imgタグをsrc丸ごと削除
        const images = str.match(/<img(.|\s)*?>/gi);
        if (images && images.length) {
          images.forEach((img) => {
            result = result.replace(img, '');
          });
        }
        // テキスト文中からhtmlタグを削除
        result = result
          .replace(/(<([^>]+)>)/gi, '')
          .replace(/\n/g, '')
          .replace(/&nbsp;/g, '');
      }
      return result;
    },

    /**
      * 3桁毎にカンマ割り振り
      * @param int num 元の数値
      */
    addComma(num, afterPoint = '', count = 0) {
      if (num !== 0 && !num) return '';
      // if (!this.isNumber(num)) return false;

      // 文字列にする
      let strNum = String(num);
      let afterDecimalPoint = afterPoint;
      if (strNum.includes('.')) {
        // 小数点以下を含む場合
        const split = strNum.split('.');
        strNum = split[0];
        afterDecimalPoint = `.${split[1]}`;
      }
      const len = Number(strNum.length);

      // 再帰的に呼び出し
      if (len > 3) {
        // 前半を引数に再帰呼び出し + 後半3桁
        strNum = `${this.addComma(strNum.substring(0, len - 3), afterDecimalPoint, count + 1)},${strNum.substring(len - 3)}`;
      }

      if (count === 0) {
        strNum += `${afterDecimalPoint}`;
      }

      return `${strNum}`;
    },


    /**
     * filter群
     */
    filterDate(date) {
      return moment(date).format('YYYY.MM.DD');
    },
    filterDate_ja(date) {
      return moment(date).format('YYYY年M月D日');
    },
    filterDatetime(date) {
      return moment(date).format('YYYY.M.D HH:mm');
    },
    filterNumber_format(value) {
      // valueを文字列に変換
      const str = String(value);
      if (!str.match(/^\d+$/)) {
        return value;
      }
      const formatter = new Intl.NumberFormat('ja-JP');
      return formatter.format(str);
    },
    filterTax_price(value) {
      let includeTax = value * 1.1;
      // 小数点以下切り捨て
      includeTax = this.roundDown(includeTax, 0);
      // 税込価格を文字列に変換
      const str = String(includeTax);
      if (!str.match(/^\d+$/)) {
        return includeTax;
      }
      const formatter = new Intl.NumberFormat('ja-JP');
      return `${formatter.format(str)}（税込）`;
    },
    filterZip(value) {
      const str = value ? String(value) : null;
      let result = '';
      if (str && str.includes('-')) {
        // ハイフンが含まれている場合はそのまま出力
        result = `〒${str}`;
      } else if (str && !str.includes('-')) {
        // ハイフンを付与して出力
        result = `〒${str.substr(0, 3)}-${str.substr(3, 4)}`;
      }
      return result;
    },
    filterRemove_hyphen(value) {
      const str = value.replace(/-/g, '');
      return str;
    },
    /** 表示文字数制限 */
    filterOmitted(limit, str) {
      const string = cloneDeep(str);
      if (string.length > limit) {
        return `${string.substr(0, limit)}...`;
      }
      return string;
    },
  },
};
