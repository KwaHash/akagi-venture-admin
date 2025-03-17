import { createApp } from 'vue';
import Vuelidate from '@vuelidate/core';
// import VueScrollTo from 'vue-scrollto';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import VueGtag from 'vue-gtag-next';
// import VCalendar from 'v-calendar';
import App from './App.vue';
import axios from './plugins/axios';
// import './registerServiceWorker';
import router from './router';
import store from './store';

const app = createApp(App);
app.config.globalProperties.axios = axios;
app.use(store);
app.use(router);
app.use(Vuelidate);
// app.use(VueScrollTo);
// app.use(VueGtag, {
//   property: {
//     id: '',
//     router,
//   },
// });
// app.use(VCalendar, {});
app.mount('#app');
