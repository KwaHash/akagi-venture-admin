import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
/** @Account */
import Login from '@/views/Account/Login.vue';
import SignupPassword from '@/views/Account/SignupPassword.vue';
import ForgotPassword from '@/views/Account/ForgotPassword.vue';
import ResetPassword from '@/views/Account/ResetPassword.vue';

/** @Shop */
import ShopList from '@/views/Shop/ShopList.vue';

/** @Point */
import Point from '@/views/Point/Point.vue';
import PointAdd from '@/views/Point/PointAdd.vue';
import PointConfirm from '@/views/Point/PointConfirm.vue';

/** @Holiday */
import HolidayRegister from '@/views/Holiday/HolidayRegister.vue';

import AdminUsers from '@/views/AdminUsers.vue';

import Post from '@/views/Cms/Post.vue';
import Preview from '@/views/Cms/Preview/index.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup/password',
    name: 'Signup/password',
    component: SignupPassword,
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: {
      title: 'パスワード再発行',
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    meta: {
      title: 'パスワード再発行',
    },
  },
  {
    path: '/admin-users',
    name: 'AdminUsers',
    component: AdminUsers,
  },
  {
    path: '/point',
    name: 'Point',
    component: Point,
  },
  {
    path: '/post',
    name: 'Post',
    component: Post,
  },
  {
    path: '/Post/preview',
    name: 'Preview',
    component: Preview,
  },
  {
    path: '/point/add',
    name: 'PointAdd',
    component: PointAdd,
  },
  {
    path: '/point/confirm',
    name: 'PointConfirm',
    component: PointConfirm,
  },
  {
    path: '/shop',
    name: 'ShopList',
    component: ShopList,
  },
  {
    path: '/holiday/:name',
    name: 'HolidayRegister',
    component: HolidayRegister,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
