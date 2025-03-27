/**
 * axiosの共通設定
 */
import axios from 'axios';

let baseURL = process.env.VUE_APP_APIBASE;
let Authorization = process.env.VUE_APP_TOKEN;
// 環境変数の切り替え
switch (process.env.VUE_APP_NODE_ENV) {
  case 'development':
    Authorization = process.env.VUE_APP_DEV_TOKEN;
    baseURL = process.env.VUE_APP_DEV_APIBASE;
    break;
  case 'production':
    Authorization = process.env.VUE_APP_PROD_TOKEN;
    baseURL = process.env.VUE_APP_PROD_APIBASE;
    break;
  default: break;
}


export default axios.create({
  headers: {
    Authorization,
  },
  baseURL,
  responseType: 'json',
});
